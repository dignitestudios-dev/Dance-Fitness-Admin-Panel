"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { API } from "@/lib/api/axios";
import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ================= TYPES ================= */

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  price: string;
  quantity: number | null;
  products_image?: string | null;
}

interface OrderDetails {
  id: number;
  total_items: number;
  total_amount: string;
  status: string;
  delivery_charges: string;
  ordered_date: string;
  order_items: OrderItem[];
}

/* ================= COMPONENT ================= */

export default function OrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !userId) return;
    fetchOrderDetails();
  }, [orderId, userId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await API.get("/admin/user/orders/order-details", {
        params: { user_uid: userId, order_id: orderId },
      });
      setOrder(res.data);
    } catch (err) {
      console.error("Order details API error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-destructive">Failed to load order details</p>;
  }

  return (
    <div className="space-y-6">
      {/* ===== ORDER HEADER ===== */}
      <Card className="border-l-4 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Order #{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Badge className="capitalize">{order.status}</Badge>
            <Badge variant="secondary">
              {order.total_items} item{order.total_items > 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline">Total: ${order.total_amount}</Badge>
            <Badge variant="secondary">Delivery: {order.delivery_charges}</Badge>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">Ordered on: {order.ordered_date}</p>
        </CardContent>
      </Card>

      {/* ===== ORDER ITEMS ===== */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {order.order_items.map((item) => (
    <Card
      key={item.id}
      className="overflow-hidden hover:shadow-lg transition rounded-md"
    >
      {/* Image container */}
      <div className="w-full h-40 bg-gray-100 overflow-hidden">
        <img
          src={
            item.products_image
              ? `https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${item.products_image}`
              : "https://placehold.co/400x200?text=No+Image"
          }
          alt={item.product_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/400x200?text=No+Image";
          }}
        />
      </div>

      <CardContent className="space-y-1">
        <h2 className="font-semibold text-base">{item.product_name}</h2>
        <p className="text-sm text-muted-foreground">
          Price: ${item.price} {item.quantity ? `x ${item.quantity}` : ""}
        </p>
      </CardContent>
    </Card>
  ))}
</div>

    </div>
  );
}
