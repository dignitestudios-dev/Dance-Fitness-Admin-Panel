"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { DataTable } from "./components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";

/* ================= TYPES ================= */

interface BackendUser {
  id: number;
  name: string;
  email: string;
  registered: string;
  roles: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  registered: string;
  roles: string;
}

interface UsersApiResponse {
  status: boolean;
  message: string;
  data: BackendUser[];
  current_page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_more: boolean;
}

/* ================= COMPONENT ================= */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // keeping stats UI intact
  const [stats, setStats] = useState({
    total_users: 0,
    activate_users: 0,
    deactivated_users: 0,
  });

  /* =============== HELPERS =============== */

  const mapUser = (u: BackendUser): User => ({
    id: u.id,
    name: u.name,
    email: u.email,
    registered: u.registered,
    roles: u.roles,
  });

  /* =============== API CALL =============== */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await API.get<UsersApiResponse>(
          `/admin/users?page=${page}&per_page=${pageSize}`
        );

        // updated according to new API
        setUsers(res.data.data.map(mapUser));
        setLastPage(res.data.total_pages);

        // fake stats from current response to preserve UI
        const total = res.data.total_items;

        setStats({
          total_users: total,
          activate_users: total,
          deactivated_users: 0,
        });
      } catch (error) {
        console.error("Users API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, pageSize]);

  /* =============== UI =============== */

  if (loading) {
    return <p className="text-muted-foreground">Loading users...</p>;
  }

  return (
    <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold pl-3">User Management</h1>

      {/* ===== STAT CARDS ===== */}
      <div className="@container/main  ">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Users"
            value={stats.total_users}
            icon={Users}
          />

          <StatCard
            title="Active Users"
            value={stats.activate_users}
            icon={UserCheck}
          />

          <StatCard
            title="Deactivated Users"
            value={stats.deactivated_users}
            icon={UserX}
          />
        </div>
      </div>

      {/* ===== USERS TABLE ===== */}
      <div className="@container/main ">
        <DataTable
          users={users}
          currentPage={page}
          lastPage={lastPage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: any;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 pt-2">
        <Icon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}