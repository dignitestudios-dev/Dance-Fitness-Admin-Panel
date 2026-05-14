"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { API } from "@/lib/api/axios";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ================= TYPES ================= */

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  total: string;
  image_url?: string | null;
}

interface OrderDetails {
  id: number;
  total_items: number;
  total_amount: string;
  status: string;
  delivery_charges: string;
  ordered_date: string;
  created_at: string;
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
    if (!orderId) return;

    fetchOrderDetails();
  }, [orderId, userId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await API.get(`/admin/orders/${orderId}`, {
        params: {
          user_id: userId,
        },
      });

      setOrder(res.data);
    } catch (err) {
      console.error("Order details API error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-destructive text-lg">
          Failed to load order details
        </p>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8">
      {/* ================= ORDER HEADER ================= */}

      <Card className="border-l-4 border-primary shadow-sm">
        <CardHeader className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                Order #{order.id}
              </CardTitle>

              <p className="text-sm text-muted-foreground mt-1">
                Ordered on{" "}
                {new Date(
                  order.created_at || order.ordered_date
                ).toLocaleString()}
              </p>
            </div>

            <Badge className="capitalize w-fit px-4 py-1 text-sm">
              {order.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="mb-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InfoCard
              label="Total Items"
              value={`${order.total_items}`}
            />

            <InfoCard
              label="Delivery Charges"
              value={`${order.delivery_charges}`}
            />

            <InfoCard
              label="Total Amount"
              value={`$${order.total_amount}`}
              highlight
            />
          </div>
        </CardContent>
      </Card>

      {/* ================= ORDER ITEMS ================= */}

      <div>
        <div className="mb-5">
          <h2 className="text-xl font-semibold">
            Ordered Products
          </h2>

          <p className="text-sm text-muted-foreground">
            {order.total_items} item
            {order.total_items > 1 ? "s" : ""} in this order
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {order.order_items.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden rounded-xl hover:shadow-md transition-all duration-200"
            >
              {/* PRODUCT IMAGE */}

              <div className="aspect-video bg-muted overflow-hidden">
                <img
                  src={
                    item.image_url ||
                    "https://placehold.co/600x400?text=No+Image"
                  }
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (
                      e.currentTarget as HTMLImageElement
                    ).src =
                      "https://placehold.co/600x400?text=No+Image";
                  }}
                />
              </div>

              {/* PRODUCT INFO */}

              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {item.name}
                  </h3>

                  <p className="text-sm text-muted-foreground mt-1">
                    Product ID: #{item.product_id}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Quantity
                    </span>

                    <span className="font-medium">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Item Total
                    </span>

                    <span className="font-semibold text-primary text-lg">
                      ${item.total}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function InfoCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border p-4 bg-background">
      <p className="text-sm text-muted-foreground mb-1">
        {label}
      </p>

      <p
        className={`text-lg font-semibold ${
          highlight ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}