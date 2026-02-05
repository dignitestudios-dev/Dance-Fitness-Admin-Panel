"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  avatar?: string;
}

interface Order {
  id: number;
  user_id: number;
  shipping_delivery_address: string;
  status: string;
  charged_amount: string;
  payment_method_last_digits?: string;
  created_at: string;
  items: OrderItem[];
  user: User;
}

interface PaginatedOrders {
  current_page: number;
  data: Order[];
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginatedOrders>({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  const fetchOrders = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/orders", { params: { page } });
      setOrders(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        data: res.data.data,
        last_page: res.data.last_page,
        next_page_url: res.data.next_page_url,
        prev_page_url: res.data.prev_page_url,
      });
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No orders found.
          </p>
        ) : (
       orders.map((o) => (
  <Card key={o.id} className="relative overflow-visible">
    {/* Status Badge top-left */}
    <Badge
      className="absolute top-4 right-2 z-10"
      variant={
        o.status === "completed"
          ? "default"
          : o.status === "in-progress"
          ? "secondary"
          : "destructive"
      }
    >
      {o.status}
    </Badge>

    <CardContent className="p-4 space-y-3">
      {/* User Info */}
      <div className="flex items-center gap-3">
        {o.user.avatar && (
          <img
            src={`https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${o.user.avatar}`}
            alt={o.user.user_name}
            className="h-10 w-10 rounded-full"
          />
        )}
        <div>
          <p className="font-semibold">
            {o.user.first_name} {o.user.last_name} ({o.user.user_name})
          </p>
          <p className="text-sm text-muted-foreground">{o.user.email}</p>
        </div>
      </div>

      {/* Shipping */}
      <div>
        <p className="font-medium">Shipping Address:</p>
        <p className="text-sm text-muted-foreground">{o.shipping_delivery_address}</p>
      </div>

      {/* Items */}
      <div>
        <p className="font-medium">Items:</p>
        <ul className="text-sm text-muted-foreground list-disc list-inside">
          {o.items.map((item) => (
            <li key={item.id}>
              Product #{item.product_id} — Qty: {item.quantity} — Price: $
              {Number(item.price).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {/* Payment & Info */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <p>Total: ${Number(o.charged_amount || 0).toFixed(2)}</p>
          {o.payment_method_last_digits && (
            <p>Card: **** **** **** {o.payment_method_last_digits}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Ordered at: {new Date(o.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
))

        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          variant="outline"
          disabled={!pagination.prev_page_url}
          onClick={() => fetchOrders(pagination.current_page - 1)}
        >
          Previous
        </Button>

        <span className="text-sm">
          Page {pagination.current_page} of {pagination.last_page}
        </span>

        <Button
          variant="outline"
          disabled={!pagination.next_page_url}
          onClick={() => fetchOrders(pagination.current_page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
