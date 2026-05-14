"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";

import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  Calendar,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  total: string;
  image_url: string;
}

interface Order {
  id: number;
  total_items: number;
  status: string;
  delivery_charges: string;
  total_amount: string;
  ordered_date: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [open, setOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [markingComplete, setMarkingComplete] =
    useState(false);

  // FETCH ORDERS
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);

      const res = await API.get(
        `/admin/orders?per_page=20&page=${page}`
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      setOrders(data);

      setCurrentPage(res.data.current_page || 1);
      setLastPage(res.data.last_page || 1);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // FETCH ORDER DETAILS
  const fetchOrderDetails = async (orderId: number) => {
    try {
      setDetailsLoading(true);
      setOpen(true);

      const res = await API.get(`/admin/orders/${orderId}`);

      setSelectedOrder(res.data);
    } catch (error) {
      console.error("Failed to fetch order details", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // MARK COMPLETE
  const markAsComplete = async () => {
    if (!selectedOrder) return;

    try {
      setMarkingComplete(true);

      await API.post(`/admin/orders/${selectedOrder.id}`, {
        status: "completed",
      });

      // update modal data
      setSelectedOrder({
        ...selectedOrder,
        status: "completed",
      });

      // update table data
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: "completed" }
            : order
        )
      );
    } catch (error) {
      console.error("Failed to mark order complete", error);
    } finally {
      setMarkingComplete(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "default";

      case "processing":
        return "secondary";

      case "pending":
        return "outline";

      case "failed":
        return "destructive";

      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Orders
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage customer orders
          </p>
        </div>

        <Badge variant="outline">
          {orders.length} Orders
        </Badge>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>

            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center"
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>

                    <TableCell className="font-medium">
                      #{order.id}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={getStatusColor(order.status)}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      $
                      {Number(order.total_amount).toFixed(
                        2
                      )}
                    </TableCell>

                    <TableCell>
                      {order.total_items}
                    </TableCell>

                    <TableCell>
                      {new Date(
                        order.ordered_date
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          fetchOrderDetails(order.id)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>

          </Table>
        </CardContent>
      </Card>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">

        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {lastPage}
        </p>

        <div className="flex gap-2">

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() =>
              fetchOrders(currentPage - 1)
            }
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === lastPage}
            onClick={() =>
              fetchOrders(currentPage + 1)
            }
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>

        </div>
      </div>

      {/* DETAILS MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">

          <DialogHeader>
            <DialogTitle>
              Order #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6">

              {/* STATUS + COMPLETE BUTTON */}
              <div className="flex items-center justify-between">

                <Badge
                  variant={getStatusColor(
                    selectedOrder.status
                  )}
                  className="capitalize"
                >
                  {selectedOrder.status}
                </Badge>

                {(selectedOrder.status ===
                  "processing" ||
                  selectedOrder.status ===
                    "pending") && (
                  <Button
                    onClick={markAsComplete}
                    disabled={markingComplete}
                  >
                    {markingComplete ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}

                    Mark as Complete
                  </Button>
                )}
              </div>

              {/* ORDER INFO */}
              <div className="grid grid-cols-2 gap-4">

                <div className="border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <DollarSign className="h-4 w-4" />
                    Total Amount
                  </div>

                  <p className="text-lg font-semibold">
                    $
                    {Number(
                      selectedOrder.total_amount
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Package className="h-4 w-4" />
                    Total Items
                  </div>

                  <p className="text-lg font-semibold">
                    {selectedOrder.total_items}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    Ordered Date
                  </div>

                  <p>
                    {new Date(
                      selectedOrder.ordered_date
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="border rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Delivery Charges
                  </div>

                  <p>
                    {selectedOrder.delivery_charges}
                  </p>
                </div>

              </div>

              {/* ITEMS */}
              <div>
                <h3 className="font-semibold mb-4">
                  Order Items
                </h3>

                <div className="space-y-4">

                  {selectedOrder.order_items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border rounded-xl p-4"
                      >

                        <img
                          src={
                            item.image_url ||
                            "/placeholder.png"
                          }
                          alt={item.name}
                          className="w-20 h-20 rounded-lg border object-cover"
                        />

                        <div className="flex-1">

                          <h4 className="font-medium">
                            {item.name ||
                              "Unnamed Product"}
                          </h4>

                          <p className="text-sm text-muted-foreground">
                            Product ID:{" "}
                            {item.product_id}
                          </p>

                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>

                        </div>

                        <div className="font-semibold">
                          $
                          {Number(
                            item.total
                          ).toFixed(2)}
                        </div>

                      </div>
                    )
                  )}

                </div>
              </div>

            </div>
          ) : null}

        </DialogContent>
      </Dialog>
    </div>
  );
}