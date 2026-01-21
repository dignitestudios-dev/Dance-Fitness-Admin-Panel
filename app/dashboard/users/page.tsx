"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { DataTable } from "./components/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";

/* ================= TYPES ================= */

interface BackendUser {
  id: number;
  uid: string;
  first_name: string | null;
  last_name: string | null;
  user_name: string | null;
  email: string;
  avatar: string | null;
  is_deactivate: boolean;
  joined_date: string;
}

interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  avatar: string;
  status: "Active" | "Inactive";
  joinedDate: string;
  address: string;
  is_deactivate: boolean;
}

interface UsersApiResponse {
  total_users: number;
  activate_users: number;
  deactivated_users: number;
  users: {
    current_page: number;
    last_page: number;
    data: BackendUser[];
  };
}

/* ================= COMPONENT ================= */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_users: 0,
    activate_users: 0,
    deactivated_users: 0,
  });

  /* =============== HELPERS =============== */

  const generateAvatar = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const mapUser = (u: BackendUser): User => {
    const fullName =
      [u.first_name, u.last_name].filter(Boolean).join(" ") ||
      u.user_name ||
      "N/A";

    return {
      id: u.id,
      uid: u.uid,
      name: fullName,
      email: u.email,
      avatar: u.avatar ?? generateAvatar(fullName),
      status: u.is_deactivate ? "Inactive" : "Active",
      joinedDate: u.joined_date,
      address: "",
      is_deactivate: u.is_deactivate,
    };
  };

  /* =============== API CALL =============== */

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await API.get<UsersApiResponse>(
          `/admin/users?page=${page}&per_page=${pageSize}`
        );

        setUsers(res.data.users.data.map(mapUser));
        setLastPage(res.data.users.last_page);

        setStats({
          total_users: res.data.total_users,
          activate_users: res.data.activate_users,
          deactivated_users: res.data.deactivated_users,
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
      {/* ===== STAT CARDS ===== */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Users" value={stats.total_users} icon={Users} />
          <StatCard title="Active Users" value={stats.activate_users} icon={UserCheck} />
          <StatCard
            title="Deactivated Users"
            value={stats.deactivated_users}
            icon={UserX}
          />
        </div>
      </div>

      {/* ===== USERS TABLE ===== */}
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
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
      <CardContent className="space-y-2 pt-6">
        <Icon className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
