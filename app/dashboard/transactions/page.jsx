"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* MOCK DATA */

const purchases = [
  {
    id: "pi_123",
    user: "john@example.com",
    plan: "Pro Membership",
    amount: "$29.99",
    status: "Succeeded",
    date: "2026-01-05",
  },
  {
    id: "pi_456",
    user: "jane@example.com",
    plan: "Premium Membership",
    amount: "$49.99",
    status: "Failed",
    date: "2026-01-03",
  },
]

const shopItems = [
  {
    id: 1,
    name: "12-Week Strength Program",
    price: "$59.00",
    status: "Active",
  },
  {
    id: 2,
    name: "Mobility Add-On",
    price: "$19.00",
    status: "Disabled",
  },
]

const reminders = [
  {
    id: 1,
    name: "Scheduled Workout Reminder",
    schedule: "Daily · 7:00 AM",
    enabled: true,
  },
]

export default function ShopInAppPurchasesPage() {
  return (
    <>
     {/* HEADER + CREATE NOTIFICATION */}
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Shop & In-App Purchases</CardTitle>
          <CardDescription>
            Monitor Stripe purchases, manage shop items, notifications, and
            workout reminders.
          </CardDescription>
        </div>

        {/* CREATE NOTIFICATION MODAL */}
       
      </CardHeader>
    <Card>
     

      <CardContent>
        <Tabs defaultValue="purchases">
          <TabsList className="mb-6">
            <TabsTrigger value="purchases">
              In-App Purchases
            </TabsTrigger>
            <TabsTrigger value="shop">
              Shop Items
            </TabsTrigger>
            <TabsTrigger value="reminders">
              Workout Reminders
            </TabsTrigger>
          </TabsList>

          {/* STRIPE PURCHASE MONITORING */}
          <TabsContent value="purchases">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.user}</TableCell>
                    <TableCell>{purchase.plan}</TableCell>
                    <TableCell>{purchase.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          purchase.status === "Succeeded"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{purchase.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* MANUAL SHOP ITEM MANAGEMENT */}
          <TabsContent value="shop">
           

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {shopItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={item.status === "Active"} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* AUTOMATED REMINDERS */}
          <TabsContent value="reminders">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reminder</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {reminders.map((reminder) => (
                  <TableRow key={reminder.id}>
                    <TableCell className="font-medium">
                      {reminder.name}
                    </TableCell>
                    <TableCell>{reminder.schedule}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch checked={reminder.enabled} />
                        <Badge
                          variant={
                            reminder.enabled
                              ? "default"
                              : "secondary"
                          }
                        >
                          {reminder.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
        </>

  )
}
