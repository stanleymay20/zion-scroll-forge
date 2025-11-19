import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
      undefined,
      cryptoProvider
    )

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing webhook: ${receivedEvent.type}`)

    switch (receivedEvent.type) {
      case 'customer.created': {
        const customer = receivedEvent.data.object as Stripe.Customer
        
        // Update billing record with Stripe customer ID
        const { error } = await supabaseClient
          .from('billing')
          .update({ stripe_customer_id: customer.id })
          .eq('billing_email', customer.email)

        if (error) {
          console.error('Error updating customer:', error)
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = receivedEvent.data.object as Stripe.Subscription
        
        const { error } = await supabaseClient
          .from('billing')
          .update({
            subscription_id: subscription.id,
            subscription_status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            plan_id: subscription.items.data[0]?.price?.id || null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer as string)

        if (error) {
          console.error('Error updating subscription:', error)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = receivedEvent.data.object as Stripe.Subscription
        
        const { error } = await supabaseClient
          .from('billing')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('subscription_id', subscription.id)

        if (error) {
          console.error('Error canceling subscription:', error)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = receivedEvent.data.object as Stripe.Invoice
        
        // Get billing record
        const { data: billing } = await supabaseClient
          .from('billing')
          .select('*')
          .eq('stripe_customer_id', invoice.customer as string)
          .single()

        if (billing) {
          // Create payment record
          const { error: paymentError } = await supabaseClient
            .from('payments')
            .insert({
              user_id: billing.user_id,
              billing_id: billing.id,
              stripe_payment_intent_id: invoice.payment_intent as string,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: 'succeeded',
              description: invoice.description || 'Subscription payment',
              receipt_url: invoice.hosted_invoice_url,
              created_at: new Date().toISOString()
            })

          if (paymentError) {
            console.error('Error creating payment record:', paymentError)
          }

          // Process enrollment if this is a tuition payment
          if (invoice.metadata?.enrollment_id) {
            await processEnrollmentPayment(supabaseClient, invoice.metadata.enrollment_id, billing.user_id)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = receivedEvent.data.object as Stripe.Invoice
        
        // Get billing record
        const { data: billing } = await supabaseClient
          .from('billing')
          .select('*')
          .eq('stripe_customer_id', invoice.customer as string)
          .single()

        if (billing) {
          // Create failed payment record
          const { error } = await supabaseClient
            .from('payments')
            .insert({
              user_id: billing.user_id,
              billing_id: billing.id,
              stripe_invoice_id: invoice.id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: 'failed',
              description: 'Failed payment',
              failure_reason: 'Payment failed',
              created_at: new Date().toISOString()
            })

          if (error) {
            console.error('Error creating failed payment record:', error)
          }

          // Send notification to user
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: billing.user_id,
              type: 'payment_failed',
              title: 'Payment Failed',
              message: 'Your recent payment attempt was unsuccessful. Please update your payment method.',
              data: { invoice_id: invoice.id },
              created_at: new Date().toISOString()
            })
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = receivedEvent.data.object as Stripe.PaymentIntent
        
        // Handle one-time payments (tuition, fees, etc.)
        if (paymentIntent.metadata?.user_id && paymentIntent.metadata?.type === 'tuition') {
          const userId = paymentIntent.metadata.user_id
          const institutionId = paymentIntent.metadata.institution_id
          
          // Get or create student account
          const { data: account } = await supabaseClient.rpc('create_student_account', {
            user_uuid: userId,
            institution_uuid: institutionId
          })

          if (account) {
            // Record the payment
            await supabaseClient.rpc('post_financial_transaction', {
              account_uuid: account,
              trans_type: 'payment',
              trans_amount: paymentIntent.amount,
              trans_description: paymentIntent.description || 'Tuition payment',
              ref_id: paymentIntent.id,
              ref_type: 'stripe_payment',
              created_by_uuid: userId
            })

            // Award ScrollCoins for payment
            await supabaseClient.rpc('earn_scrollcoin', {
              user_uuid: userId,
              amount: Math.floor(paymentIntent.amount / 1000), // 1 coin per dollar
              reason: 'Payment: ' + (paymentIntent.description || 'Tuition'),
              reference_id: paymentIntent.id,
              reference_type: 'payment'
            })

            // Check if this enables enrollment
            if (paymentIntent.metadata?.course_id) {
              await processEnrollmentAfterPayment(supabaseClient, userId, paymentIntent.metadata.course_id)
            }
          }
        }
        break
      }

      case 'setup_intent.succeeded': {
        const setupIntent = receivedEvent.data.object as Stripe.SetupIntent
        
        if (setupIntent.metadata?.user_id) {
          // Update billing record with payment method
          const { error } = await supabaseClient
            .from('billing')
            .update({
              payment_method: {
                id: setupIntent.payment_method as string,
                type: 'card' // We'll get details later if needed
              },
              auto_payment_enabled: true,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', setupIntent.metadata.user_id)

          if (error) {
            console.error('Error updating payment method:', error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${receivedEvent.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processEnrollmentPayment(supabaseClient: any, enrollmentId: string, userId: string) {
  try {
    // Update enrollment status to active
    const { error } = await supabaseClient
      .from('enrollments')
      .update({ 
        status: 'active',
        enrolled_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating enrollment:', error)
      return
    }

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'enrollment_activated',
        title: 'Enrollment Confirmed',
        message: 'Your payment has been processed and your enrollment is now active!',
        data: { enrollment_id: enrollmentId },
        created_at: new Date().toISOString()
      })

  } catch (error) {
    console.error('Error processing enrollment payment:', error)
  }
}

async function processEnrollmentAfterPayment(supabaseClient: any, userId: string, courseId: string) {
  try {
    // Check if user has sufficient payment for the course
    const { data: course } = await supabaseClient
      .from('courses')
      .select('price, title')
      .eq('id', courseId)
      .single()

    if (!course) return

    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabaseClient
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'active',
        enrolled_at: new Date().toISOString()
      })
      .select()
      .single()

    if (enrollError) {
      console.error('Error creating enrollment:', enrollError)
      return
    }

    // Award ScrollCoins for enrollment
    await supabaseClient.rpc('earn_scrollcoin', {
      user_uuid: userId,
      amount: 100, // 100 coins for course enrollment
      reason: `Enrolled in: ${course.title}`,
      reference_id: courseId,
      reference_type: 'course_enrollment'
    })

    // Create notification
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'course_enrollment',
        title: 'Course Enrollment Successful',
        message: `You have successfully enrolled in ${course.title}!`,
        data: { course_id: courseId, enrollment_id: enrollment.id },
        action_url: `/courses/${courseId}`,
        created_at: new Date().toISOString()
      })

  } catch (error) {
    console.error('Error processing enrollment after payment:', error)
  }
}