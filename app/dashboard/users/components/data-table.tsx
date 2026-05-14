"use client";

import { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ================= TYPES ================= */

interface User {
  id: number;
  name: string;
  email: string;
  registered: string;
  roles: string;
}

interface DataTableProps {
  users: User[];

  currentPage: number;
  lastPage: number;
  pageSize: number;

  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // SEARCH
  search: string;
  onSearchChange: (value: string) => void;
}

/* ================= COMPONENT ================= */

export function DataTable({
  users,
  currentPage,
  lastPage,
  pageSize,
  onPageChange,
  onPageSizeChange,

  search,
  onSearchChange,
}: DataTableProps) {
  const router = useRouter();

  const [searchValue, setSearchValue] =
  useState(search);

/* ================= SEARCH DEBOUNCE ================= */

useEffect(() => {
  const timer = setTimeout(() => {
    onSearchChange(searchValue);
  }, 500);

  return () => clearTimeout(timer);
}, [searchValue]);

  return (
    <div className="w-full space-y-4">

      {/* ================= TOP BAR ================= */}

      <div className="flex items-center justify-between gap-4">

        {/* SEARCH */}
        <div className="relative w-full max-w-sm">

          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search users..."
            value={searchValue}
            onChange={(e) =>
              setSearchValue(e.target.value)
            }
            className="pl-9"
          />
        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="rounded-md border">

        <Table>

          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.length ? (
              users.map((user) => (
                <TableRow key={user.id}>

                  {/* USER INFO */}
                  <TableCell>

                    <div className="flex items-center gap-3">

                      <Avatar className="h-8 w-8">

                        <AvatarFallback className="text-xs font-medium">
                          {user.name
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>

                      </Avatar>

                      <div className="flex flex-col">

                        <span className="font-medium">
                          {user.name}
                        </span>

                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>

                      </div>

                    </div>

                  </TableCell>

                  {/* ROLE */}
                  <TableCell>

                    <Badge
                      variant="secondary"
                      className="capitalize"
                    >
                      {user.roles}
                    </Badge>

                  </TableCell>

                  {/* REGISTERED */}
                  <TableCell>

                    {new Date(
                      user.registered
                    ).toLocaleDateString()}

                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(
                          `/dashboard/users/${user.id}`
                        )
                      }
                    >
                      <Eye className="size-4" />
                    </Button>

                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>

                <TableCell
                  colSpan={4}
                  className="h-24 text-center"
                >
                  No users found.
                </TableCell>

              </TableRow>
            )}
          </TableBody>

        </Table>

      </div>

      {/* ================= PAGINATION ================= */}

      <div className="flex items-center justify-between py-4">

        <div className="text-sm text-muted-foreground">
          Showing {users.length} users
        </div>

        <div className="flex items-center gap-2">

          {/* PREVIOUS */}
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() =>
              onPageChange(currentPage - 1)
            }
          >
            Previous
          </Button>

          {/* PAGE INFO */}
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {lastPage}
          </div>

          {/* NEXT */}
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === lastPage}
            onClick={() =>
              onPageChange(currentPage + 1)
            }
          >
            Next
          </Button>

        </div>

      </div>
    </div>
  );
}