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
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const workouts = [
  {
    id: 1,
    title: "Full Body Strength",
    type: "Workout",
    lastUpdated: "2026-01-04",
    synced: true,
    visible: true,
    archived: false,
  },
  {
    id: 2,
    title: "Beginner 4-Week Program",
    type: "Training Plan",
    lastUpdated: "2025-12-15",
    synced: false,
    visible: true,
    archived: false,
  },
  {
    id: 3,
    title: "HIIT Burn Advanced",
    type: "Workout",
    lastUpdated: "2024-10-01",
    synced: true,
    visible: false,
    archived: true,
  },
]

export default function WorkoutTrainingManagement() {
  return (
    <>
    <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Workout & Training Plan Management</CardTitle>
          <CardDescription>
            Verify sync status, refresh content, control visibility, and archive
            outdated workouts or plans.
          </CardDescription>
        </div>

        <Button variant="outline">Refresh All</Button>
      </CardHeader>

    <Card>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead>Sync Status</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {workouts.map((item) => (
              <TableRow
                key={item.id}
                className={item.archived ? "opacity-60" : ""}
              >
                <TableCell className="font-medium">
                  {item.title}
                  {item.archived && (
                    <Badge variant="outline" className="ml-2">
                      Archived
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  <Badge variant="secondary">{item.type}</Badge>
                </TableCell>

                <TableCell>{item.lastUpdated}</TableCell>

                <TableCell>
                  {item.synced ? (
                    <Badge className="bg-green-500">Synced</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Sync</Badge>
                  )}
                </TableCell>

                <TableCell>
                  <Switch checked={item.visible} />
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Refresh Sync</DropdownMenuItem>
                      <DropdownMenuItem>
                        {item.archived ? "Restore" : "Archive"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Disable Visibility
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
