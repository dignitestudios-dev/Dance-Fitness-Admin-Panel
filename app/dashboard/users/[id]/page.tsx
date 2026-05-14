"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  Loader2,
  Mail,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { API } from "@/lib/api/axios";
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

interface Collection {
  id: string;
  title: string;
  exercise_count: number;
  level: string | null;
  created_at: string | null;
}

interface Session {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
}

interface Order {
  id: number;
  total_items: number;
  total_amount: string;
  status: string;
  ordered_date: string | null;
}

interface UserDetails {
  id: number;
  first_name: string | null;
  last_name: string | null;
  user_name: string | null;
  email: string;
  role: string;
  registered_at: string | null;
  avatar?: string | null;
  is_deactivate?: boolean;

  collections?: {
    data?: Collection[];
    total_items?: number;
  };

  sessions?: {
    data?: Session[];
    total?: number;
  };

  orders?: Order[];
}

/* ================= HELPERS ================= */

const safeDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString() : "N/A";

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

        // ✅ NORMALIZE RESPONSE SAFELY
        const safeUser: UserDetails = {
          ...res.data,

          collections: {
            data: res.data?.collections?.data ?? [],
            total_items: res.data?.collections?.total_items ?? 0,
          },

          sessions: {
            data: res.data?.sessions?.data ?? [],
            total: res.data?.sessions?.total ?? 0,
          },

          orders: res.data?.orders ?? [],
        };

        setUser(safeUser);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [uid]);

  const handleToggleStatus = async () => {
    if (!user) return;

    const isCurrentlyDeactivated = user.is_deactivate;
    const endpoint = isCurrentlyDeactivated
      ? "reactive-user"
      : "deactivate-user";

    try {
      setActionLoading(true);

      await API.post(`/admin/${endpoint}/${user.id}`);

      setUser({
        ...user,
        is_deactivate: !isCurrentlyDeactivated,
      });

      toast.success(
        `User ${
          isCurrentlyDeactivated ? "reactivated" : "deactivated"
        } successfully`
      );
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="p-8 text-center text-destructive font-medium">
        User record not found.
      </p>
    );
  }

  /* ================= SAFE VALUES ================= */

  const fullName =
    [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ") ||
    user.user_name ||
    "N/A";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  /* ================= UI ================= */

  return (
    <div className="space-y-8 p-2">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <Avatar className="h-24 w-24 border-2 border-background shadow-sm">
            <AvatarImage src={user.avatar ?? ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-3xl font-bold">{fullName}</h1>

            <div className="text-sm text-muted-foreground flex gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {user.email}
              </span>

              <span className="flex items-center gap-1">
                <UserIcon className="h-3 w-3" /> {user.role}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Joined{" "}
                {safeDate(user.registered_at)}
              </span>
            </div>

            <Badge
              variant={user.is_deactivate ? "destructive" : "outline"}
              className="mt-2"
            >
              {user.is_deactivate ? "Inactive" : "Active"}
            </Badge>
          </div>
        </div>

        {/* ACTION */}
        {/* <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant={user.is_deactivate ? "default" : "destructive"}
            >
              {user.is_deactivate ? "Reactivate" : "Deactivate"}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {user.is_deactivate ? "Reactivate User?" : "Deactivate User?"}
              </AlertDialogTitle>

              <AlertDialogDescription>
                This action will update user access.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                disabled={actionLoading}
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleStatus();
                }}
              >
                {actionLoading ? "Processing..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog> */}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Collections"
          value={user.collections?.total_items ?? 0}
        />
        <StatCard
          label="Sessions Logged"
          value={user.sessions?.total ?? 0}
        />
        <StatCard
          label="Total Orders"
          value={user.orders?.length ?? 0}
        />
      </div>

      {/* TABS */}
      <Tabs defaultValue="plans">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="plans">Collections</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* COLLECTIONS */}
        <TabsContent value="plans" className="mt-6">
          <DataTable
            empty="No collections found."
            headers={["Title", "Exercises", "Level", "Created", "Action"]}
            rows={(user.collections?.data ?? []).map((p) => [
              p.title ?? "N/A",
              p.exercise_count ?? 0,
              <Badge key={p.id} variant="secondary">
                {p.level ?? "N/A"}
              </Badge>,
              safeDate(p.created_at),
              <Button
                key={p.id}
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(
                    `/dashboard/users/plans/${p.id}?userId=${user.id}`
                  )
                }
              >
                <Eye className="h-4 w-4" />
              </Button>,
            ])}
          />
        </TabsContent>

        {/* SESSIONS */}
        <TabsContent value="sessions" className="mt-6">
          <DataTable
            empty="No sessions found."
            headers={["Title", "Start", "End", "Action"]}
            rows={(user.sessions?.data ?? []).map((s) => [
              s.title ?? "N/A",
              safeDate(s.start_date),
              safeDate(s.end_date),
              <Button
                key={s.id}
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(
                    `/dashboard/users/sessions/${s.id}?userId=${user.id}`
                  )
                }
              >
                <Eye className="h-4 w-4" />
              </Button>,
            ])}
          />
        </TabsContent>

        {/* ORDERS */}
        <TabsContent value="orders" className="mt-6">
          <DataTable
            empty="No orders found."
            headers={["Order ID", "Date", "Status", "Amount", "Action"]}
            rows={(user.orders ?? []).map((o) => [
              `#${o.id}`,
              safeDate(o.ordered_date),
              <Badge key={o.id} className="capitalize">
                {o.status ?? "N/A"}
              </Badge>,
              <span key={o.id}>${o.total_amount ?? "0"}</span>,
              <Button
                key={o.id}
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(
                    `/dashboard/users/orders/${o.id}?userId=${user.id}`
                  )
                }
              >
                <Eye className="h-4 w-4" />
              </Button>,
            ])}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================= REUSABLE ================= */

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-6">
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
  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
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
                <TableCell key={j}>{cell ?? "N/A"}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}