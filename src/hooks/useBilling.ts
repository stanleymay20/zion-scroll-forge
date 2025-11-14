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

// Fetchers
export async function getBillingProducts() {
  const { data, error } = await (supabase as any)
    .from("billing_products")
    .select("*")
    .eq("is_active", true)
    .order("product_type", { ascending: true });

  if (error) throw error;
  return data as BillingProduct[];
}

export async function getBillingTransactions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("billing_transactions")
    .select(`
      *,
      product:billing_products(name, product_type)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data as BillingTransaction[];
}

export async function getUserSubscriptions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Subscription[];
}

export async function getActiveSubscription() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return data as Subscription | null;
}

export async function createCheckoutSession(params: {
  product_id: string;
  scrollcoin_discount?: number;
}) {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: params
  });

  if (error) throw error;
  return data;
}

export async function createSubscription(params: {
  plan_name: string;
  plan_type: 'monthly' | 'annual';
}) {
  const { data, error } = await supabase.functions.invoke("create-subscription", {
    body: params
  });

  if (error) throw error;
  return data;
}

export async function cancelSubscription(subscriptionId: string) {
  const { data, error } = await supabase.functions.invoke("cancel-subscription", {
    body: { subscription_id: subscriptionId }
  });

  if (error) throw error;
  return data;
}

// Hooks
export const useBillingProducts = () =>
  useQuery({ queryKey: ["billing-products"], queryFn: getBillingProducts });

export const useBillingTransactions = () =>
  useQuery({ queryKey: ["billing-transactions"], queryFn: getBillingTransactions });

export const useUserSubscriptions = () =>
  useQuery({ queryKey: ["user-subscriptions"], queryFn: getUserSubscriptions });

export const useActiveSubscription = () =>
  useQuery({ queryKey: ["active-subscription"], queryFn: getActiveSubscription });

export const useCreateCheckoutSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({ title: "✅ Checkout session created" });
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
      toast({ title: "✝️ Subscription created — Thank you for supporting God's work!" });
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
