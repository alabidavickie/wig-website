import { getAllOrders } from "@/lib/actions/orders";
import { OrdersClient } from "./orders-client";

interface OrderItem {
  quantity: number;
  product_name: string;
}

interface Order {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  payment_provider?: string;
  created_at: string;
  order_items: OrderItem[];
  is_guest?: boolean;
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrders() as Order[];
  return <OrdersClient orders={orders} />;
}
