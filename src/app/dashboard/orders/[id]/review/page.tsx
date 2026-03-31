import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getOrderById } from "@/lib/actions/orders";
import { ReviewForm } from "./review-form";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ productId?: string; productName?: string; productImage?: string }>;
}

export default async function ReviewPage({ params, searchParams }: PageProps) {
  const { id: orderId } = await params;
  const { productId, productName, productImage } = await searchParams;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const order = await getOrderById(orderId);
  if (!order || order.user_id !== user.id) notFound();
  if (order.status !== "delivered") redirect(`/dashboard/orders/${orderId}`);

  if (!productId || !productName) redirect(`/dashboard/orders/${orderId}`);

  // Verify the product is actually in this order
  const item = order.order_items?.find((i) => i.product_id === productId);
  if (!item) redirect(`/dashboard/orders/${orderId}`);

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto text-foreground bg-background p-6 md:p-8 font-sans min-h-screen">
      <ReviewForm
        orderId={orderId}
        productId={productId}
        productName={decodeURIComponent(productName)}
        productImage={productImage ? decodeURIComponent(productImage) : undefined}
        orderRef={order.id.slice(0, 8)}
      />
    </div>
  );
}
