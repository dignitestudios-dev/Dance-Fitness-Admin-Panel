"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";

import { DataTable } from "./components/data-table";

import { Card, CardContent } from "@/components/ui/card";

import {
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

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

  const [pageSize, setPageSize] =
    useState(10);

  const [lastPage, setLastPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  // SEARCH
  const [search, setSearch] =
    useState("");

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

  /* =============== FETCH USERS =============== */

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res =
        await API.get<UsersApiResponse>(
          `/admin/users?page=${page}&per_page=${pageSize}&search=${search}`
        );

      setUsers(
        (res.data.data || []).map(mapUser)
      );

      setLastPage(
        res.data.total_pages || 1
      );

      const total =
        res.data.total_items || 0;

      setStats({
        total_users: total,
        activate_users: total,
        deactivated_users: 0,
      });
    } catch (error) {
      console.error(
        "Users API error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =============== FETCH ON CHANGE =============== */

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search]);

  /* =============== SEARCH =============== */

  const handleSearchChange = (
    value: string
  ) => {
    setPage(1);
    setSearch(value);
  };

  /* =============== UI =============== */

  if (loading && users.length === 0) {
    return (
      <p className="text-muted-foreground">
        Loading users...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      <h1 className="text-2xl font-bold pl-3">
        User Management
      </h1>

      {/* ===== USERS TABLE ===== */}

      <div className="@container/main">

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

          // SEARCH
          search={search}
          onSearchChange={
            handleSearchChange
          }
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

        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        <p className="text-2xl font-bold">
          {value}
        </p>

      </CardContent>

    </Card>
  );
}