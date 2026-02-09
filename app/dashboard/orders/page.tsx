"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { 
  Loader2, 
  MoreHorizontal, 
  Package, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  User as UserIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types (Keep as provided) ---
interface OrderItem {
  id: number;
  quantity: number;
  price: string;
  product_id: number;
}

interface User {
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  avatar?: string;
}

interface Order {
  id: number;
  shipping_delivery_address: string;
  status: string;
  charged_amount: string;
  payment_method_last_digits?: string;
  created_at: string;
  items: OrderItem[];
  user: User;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchOrders = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/orders", { params: { page } });
      setOrders(res.data.data);
      setCurrentPage(res.data.current_page);
      setLastPage(res.data.last_page);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const markOrderAsComplete = async () => {
    if (!selectedOrder) return;
    try {
      await API.post(`/admin/orders/${selectedOrder.id}`, { status: "completed" });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: "completed" } : o))
      );
      setIsConfirmOpen(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "default"; // Usually green in custom themes
      case "in-progress": return "secondary";
      default: return "destructive";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground text-sm">Manage and fulfill customer requests.</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
          Total: {orders.length} Orders
        </Badge>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="group transition-colors">
                    <TableCell className="font-mono font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage 
                            src={`https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${order.user.avatar}`} 
                          />
                          <AvatarFallback><UserIcon className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">
                            {order.user.first_name} {order.user.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">{order.user.user_name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${Number(order.charged_amount).toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-primary text-white hover:text-white hover:bg-primary/90 cursor-pointer"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsConfirmOpen(true);
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4 " />
                         Mark as Complete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modern Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-muted-foreground">
          Page <strong>{currentPage}</strong> of <strong>{lastPage}</strong>
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => fetchOrders(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === lastPage}
            onClick={() => fetchOrders(currentPage + 1)}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Better Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark Order <span className="font-bold">#{selectedOrder?.id}</span> as 
              completed and notify the customer. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={markOrderAsComplete} className="bg-primary">
              Mark as Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}