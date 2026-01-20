"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  uid: string;
  name: string;
  email: string;
  avatar: string;
  address: string;
  is_deactivate: boolean;
}

interface DataTableProps {
  users: User[];
}

export function DataTable({ users }: DataTableProps) {
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(users.length / pageSize);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return users.slice(start, end);
  }, [users, currentPage, pageSize]);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // reset page
  };

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedUsers.length ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {user.address || "Not Provided"}
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary">
                      {user.is_deactivate ? "Inactive" : "Active"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        router.push(`/dashboard/users/${user.uid}`)
                      }
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Label>Show</Label>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
