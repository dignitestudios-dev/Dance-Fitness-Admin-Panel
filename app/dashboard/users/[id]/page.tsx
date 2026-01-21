"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API } from "@/lib/api/axios";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ================= TYPES ================= */

interface Paginated<T> {
  data: T[];
  total: number;
}

interface TrainingPlan {
  id: number;
  title: string;
  total_exercises: number;
  level: string;
}

interface Session {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
}

interface Order {
  id: number;
  total_items: number;
  total_amount: number;
  status: string;
}

interface UserDetails {
  user_id: number;
  user_uid: string;
  user_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar: string | null;
  location: string;
  is_deactivate: boolean;
  spent_amount: number;
  training_plans: Paginated<TrainingPlan>;
  sessions: Paginated<Session>;
  orders: Paginated<Order>;
}

/* ================= COMPONENT ================= */

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const uid = params.id;
  const router = useRouter();

  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const fetchUserDetails = async () => {
      try {
        const res = await API.get(`/admin/user-details/${uid}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [uid]);

  const handleDeactivate = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await API.post(`/admin/deactivate-user/${user.user_id}`);
      setUser({ ...user, is_deactivate: true });
      toast.success("User deactivated successfully");
    } catch {
      toast.error("Failed to deactivate user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!user) return;

    try {
      setActionLoading(true);
      await API.post(`/admin/reactive-user/${user.user_id}`);
      setUser({ ...user, is_deactivate: false });
      toast.success("User reactivated successfully");
    } catch {
      toast.error("Failed to reactivate user");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-destructive">Failed to load user details</p>;
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.user_name ||
    "N/A";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      {/* ===== USER HEADER ===== */}
      <Card>
        <CardContent className="flex items-center justify-between gap-6 pt-6 flex-wrap">
          <div className="flex items-center gap-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">{fullName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>

              <div className="flex items-center gap-3">
                <Badge variant={user.is_deactivate ? "secondary" : "default"}>
                  {user.is_deactivate ? "Inactive" : "Active"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  UID: {user.user_uid}
                </span>
              </div>
            </div>
          </div>

          {/* ===== CONFIRMATION MODAL ===== */}
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              {user.is_deactivate ? (
                <Button variant="outline">Reactivate</Button>
              ) : (
                <Button variant="destructive">Deactivate</Button>
              )}
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {user.is_deactivate
                    ? "Reactivate User?"
                    : "Deactivate User?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {user.is_deactivate
                    ? "This will restore the user's access to the platform."
                    : "This will disable the user's access to the platform. You can reactivate the user later."}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={actionLoading}>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  disabled={actionLoading}
                  onClick={async () => {
                    if (user.is_deactivate) {
                      await handleReactivate();
                    } else {
                      await handleDeactivate();
                    }
                    setConfirmOpen(false);
                  }}
                  className={
                    user.is_deactivate
                      ? ""
                      : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  }
                >
                  {actionLoading
                    ? "Processing..."
                    : user.is_deactivate
                    ? "Reactivate"
                    : "Deactivate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* ===== USER STATS ===== */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Spent Amount" value={`$${user.spent_amount}`} />
        <StatCard label="Training Plans" value={user.training_plans.total} />
        <StatCard label="Orders" value={user.orders.total} />
      </div>

      {/* ===== TABS ===== */}
      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Training Plans</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <DataTable
            empty="No training plans found."
            headers={["Title", "Exercises", "Level", "Action"]}
            rows={user.training_plans.data.map((p) => [
              p.title,
              p.total_exercises,
              p.level,
              <button
                key={p.id}
                className="p-1 rounded hover:bg-muted/40"
                onClick={() =>
                  router.push(
                    `/dashboard/users/plans/${p.id}?userId=${user.user_uid}`
                  )
                }
              >
                <Eye className="h-5 w-5 text-primary" />
              </button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="sessions">
          <DataTable
            empty="No sessions found."
            headers={["Title", "Start Date", "End Date", "Action"]}
            rows={user.sessions.data.map((s) => [
              s.title,
              s.start_date,
              s.end_date,
              <button
                key={s.id}
                className="p-1 rounded hover:bg-muted/40"
                onClick={() =>
                  router.push(
                    `/dashboard/users/sessions/${s.id}?userId=${user.user_uid}`
                  )
                }
              >
                <Eye className="h-5 w-5 text-primary" />
              </button>,
            ])}
          />
        </TabsContent>

        <TabsContent value="orders">
          <DataTable
            empty="No orders found."
            headers={["Items", "Status", "Amount", "Action"]}
            rows={user.orders.data.map((o) => [
              o.total_items,
              o.status,
              `$${o.total_amount}`,
              <button
                key={o.id}
                className="p-1 rounded hover:bg-muted/40"
                onClick={() =>
                  router.push(
                    `/dashboard/users/orders/${o.id}?userId=${user.user_uid}`
                  )
                }
              >
                <Eye className="h-5 w-5 text-primary" />
              </button>,
            ])}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function DataTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: any[][];
  empty: string;
}) {
  if (!rows.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-muted-foreground">
          {empty}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            {headers.map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
