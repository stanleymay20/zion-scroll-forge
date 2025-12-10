import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Billing — Christ provides for His people");

// Types
export interface BillingProduct {
  id: string;
  name: string;
  description?: string;
  product_type: 'course' | 'degree' | 'subscription' | 'service';
  price_cents: number;
  currency: string;
  stripe_product_id?: string;
  stripe_price_id?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface BillingTransaction {
  id: string;
  user_id: string;
  product_id?: string;
  amount_cents: number;
  currency: string;
  payment_method: string;
  transaction_type: string;
  status: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  scrollcoin_amount: number;
  notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  product?: BillingProduct;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  plan_type: string;
  price_cents: number;
  currency: string;
  status: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

// Fetchers - Use existing tables
export async function getBillingProducts(): Promise<BillingProduct[]> {
  // Use courses as products since billing_products table doesn't exist
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, description, price_cents, price, created_at")
    .order("title", { ascending: true })
    .limit(20);

  if (error) throw error;
  
  // Transform courses to BillingProduct format
  return (data || []).map((course: any) => ({
    id: course.id,
    name: course.title,
    description: course.description,
    product_type: 'course' as const,
    price_cents: course.price_cents || (course.price ? Math.round(course.price * 100) : 0),
    currency: 'USD',
    is_active: true,
    created_at: course.created_at
  }));
}

export async function getBillingTransactions(): Promise<BillingTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Use transactions table which does exist
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  
  // Transform to BillingTransaction format
  return (data || []).map((tx: any) => ({
    id: tx.id,
    user_id: tx.user_id,
    amount_cents: Math.round(Number(tx.amount) * 100),
    currency: 'USD',
    payment_method: 'scrollcoin',
    transaction_type: tx.type || 'purchase',
    status: 'completed',
    scrollcoin_amount: Number(tx.amount),
    notes: tx.description,
    created_at: tx.created_at
  }));
}

export async function getUserSubscriptions(): Promise<Subscription[]> {
  // No subscriptions table exists, return empty
  return [];
}

export async function getActiveSubscription(): Promise<Subscription | null> {
  // No subscriptions table exists, return null
  return null;
}

export async function createCheckoutSession(params: {
  product_id: string;
  scrollcoin_discount?: number;
}) {
  // Stripe integration not configured yet
  toast({
    title: "Coming Soon",
    description: "Payment processing will be available soon. Use ScrollCoins for now!",
  });
  return null;
}

export async function createSubscription(params: {
  plan_name: string;
  plan_type: 'monthly' | 'annual';
}) {
  // Stripe integration not configured yet
  toast({
    title: "Coming Soon",
    description: "Subscriptions will be available soon.",
  });
  return null;
}

export async function cancelSubscription(subscriptionId: string) {
  // Stripe integration not configured yet
  return null;
}

// Hooks
export const useBillingProducts = () =>
  useQuery({ 
    queryKey: ["billing-products"], 
    queryFn: getBillingProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useBillingTransactions = () =>
  useQuery({ 
    queryKey: ["billing-transactions"], 
    queryFn: getBillingTransactions,
    staleTime: 60 * 1000, // 1 minute
  });

export const useUserSubscriptions = () =>
  useQuery({ 
    queryKey: ["user-subscriptions"], 
    queryFn: getUserSubscriptions 
  });

export const useActiveSubscription = () =>
  useQuery({ 
    queryKey: ["active-subscription"], 
    queryFn: getActiveSubscription 
  });

export const useCreateCheckoutSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
      qc.invalidateQueries({ queryKey: ["billing-transactions"] });
    },
    onError: (e: any) => toast({
      title: "Failed to create checkout session",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useCreateSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-subscriptions"] });
      qc.invalidateQueries({ queryKey: ["active-subscription"] });
    },
    onError: (e: any) => toast({
      title: "Failed to create subscription",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast({ title: "✅ Subscription cancelled" });
      qc.invalidateQueries({ queryKey: ["user-subscriptions"] });
      qc.invalidateQueries({ queryKey: ["active-subscription"] });
    },
    onError: (e: any) => toast({
      title: "Failed to cancel subscription",
      description: e.message,
      variant: "destructive"
    })
  });
};
