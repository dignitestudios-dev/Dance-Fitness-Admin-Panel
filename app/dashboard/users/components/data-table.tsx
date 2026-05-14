"use client";

import { Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useRouter } from "next/navigation";

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
}

/* ================= COMPONENT ================= */

export function DataTable({
  users,
  currentPage,
  lastPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DataTableProps) {
  const router = useRouter();

  return (
    <div className="w-full space-y-4">
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
                          {user.name.substring(0, 2).toUpperCase()}
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

      <div className="flex items-center justify-end py-4">
        

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