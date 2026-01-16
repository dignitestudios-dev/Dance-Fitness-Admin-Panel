"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const members = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    plan: "Pro",
    status: "active",
    synced: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    plan: "Basic",
    status: "expired",
    synced: false,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    plan: "Premium",
    status: "canceled",
    synced: true,
  },
]

const statusColor = {
  active: "bg-green-500",
  expired: "bg-yellow-500",
  canceled: "bg-red-500",
}

export default function MembershipValidationSection() {
  return (
    <>
    <CardHeader>
        <CardTitle>Membership Validation & Status Updates</CardTitle>
        <CardDescription>
          Verify membership status, sync state, and manually update plans.
        </CardDescription>
      </CardHeader>
    <Card>
      

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sync</TableHead>
              <TableHead>Update</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.email}
                  </div>
                </TableCell>

                <TableCell>{member.plan}</TableCell>

                <TableCell>
                  <Badge className={statusColor[member.status]}>
                    {member.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  {member.synced ? (
                    <Badge variant="outline">Synced</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Sync</Badge>
                  )}
                </TableCell>

                <TableCell className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button size="sm">Save</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  )
}
