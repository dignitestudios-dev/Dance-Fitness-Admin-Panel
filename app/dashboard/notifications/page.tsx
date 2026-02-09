"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { Loader2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Notification {
  notification_id: number;
  title: string;
  body: string;
  date: string;
  time: string;
  status: "pending" | "delivered";
  create_at: string;
}

interface PaginatedNotifications {
  current_page: number;
  data: Notification[];
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [pagination, setPagination] = useState<PaginatedNotifications>({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  // Modal
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Date helpers
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const minTime = date === today ? currentTime : undefined;

  // Reset form on modal close
  useEffect(() => {
    if (!open) {
      setTitle("");
      setBody("");
      setDate("");
      setTime("");
      setSubmitting(false);
    }
  }, [open]);

  // Fetch notifications
  const fetchNotifications = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/notifications", { params: { page } });

      setNotifications(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        data: res.data.data,
        last_page: res.data.last_page,
        next_page_url: res.data.next_page_url,
        prev_page_url: res.data.prev_page_url,
      });
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Create notification (UTC-safe)
  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      alert("Please select date and time");
      return;
    }

    // Combine local date + time
    const localDateTime = new Date(`${date}T${time}:00`);

    // Frontend validation
    if (localDateTime < new Date()) {
      alert("Notification date and time cannot be in the past!");
      return;
    }

    // Convert to UTC
    const utcYear = localDateTime.getUTCFullYear();
    const utcMonth = String(localDateTime.getUTCMonth() + 1).padStart(2, "0");
    const utcDay = String(localDateTime.getUTCDate()).padStart(2, "0");
    const utcHours = String(localDateTime.getUTCHours()).padStart(2, "0");
    const utcMinutes = String(localDateTime.getUTCMinutes()).padStart(2, "0");
    const utcSeconds = String(localDateTime.getUTCSeconds()).padStart(2, "0");

    const formattedDate = `${utcDay}-${utcMonth}-${utcYear}`; // DD-MM-YYYY
    const formattedTime = `${utcHours}:${utcMinutes}:${utcSeconds}`; // HH:mm:ss

    setSubmitting(true);

    try {
      await API.post("/admin/notifications", {
        title,
        body,
        date: formattedDate,
        time: formattedTime,
        timezone: "UTC",
      });

      setOpen(false);
      fetchNotifications(pagination.current_page);
    } catch (err) {
      console.error("Failed to create notification:", err);
      alert("Failed to create notification");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create Notification
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Notification</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateNotification} className="space-y-3">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Textarea
                placeholder="Notification Body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />

              <Input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <Input
                type="time"
                value={time}
                min={minTime}
                onChange={(e) => setTime(e.target.value)}
                required
              />

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating..." : "Create Notification"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground">
            No notifications found.
          </p>
        ) : (
          notifications.map((n) => (
            <Card key={n.notification_id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold">{n.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {n.body}
                    </p>
                  </div>

                  <Badge
                    variant={n.status === "delivered" ? "default" : "secondary"}
                  >
                    {n.status}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground flex gap-4">
                  <span>{n.date}</span>
                  <span>{n.time}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {(pagination.prev_page_url || pagination.next_page_url) && (
  <div className="flex justify-center items-center gap-2 mt-4">
    <Button
      variant="outline"
      disabled={!pagination.prev_page_url}
      onClick={() => fetchNotifications(pagination.current_page - 1)}
    >
      Previous
    </Button>

    <span className="text-sm">
      Page {pagination.current_page} of {pagination.last_page}
    </span>

    <Button
      variant="outline"
      disabled={!pagination.next_page_url}
      onClick={() => fetchNotifications(pagination.current_page + 1)}
    >
      Next
    </Button>
  </div>
)}

    </div>
  );
}
