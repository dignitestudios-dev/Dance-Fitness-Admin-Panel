"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { API } from "@/lib/api/axios";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ================= TYPES ================= */

interface SessionExercise {
  id: number;
  title: string;
  categories: string;
  duration: string;
  status: string;
}

interface SessionDay {
  id: number;
  title: string;
  total_exercises: number;
  duration: string;
  level: string;
  description: string;
  date: string;
  exercises: SessionExercise[];
}

interface SessionDetails {
  id: number;
  title: string;
  type: string;
  days: string[];
  start_date: string;
  end_date: string;
  time: string;
  scheduling: SessionDay[];
}

/* ================= COMPONENT ================= */

export default function SessionDetailsPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || !userId) return;
    fetchSessionDetails();
  }, [sessionId, userId]);

  const fetchSessionDetails = async () => {
    try {
      const res = await API.get(
        "/admin/user/sessions/session-details",
        {
          params: {
            user_uid: userId,
            session_id: sessionId,
          },
        }
      );
      setSession(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <p className="text-destructive">Failed to load session</p>;
  }

  return (
    <div className="space-y-10">
      {/* ================= SESSION HERO ================= */}
      <Card className="border-l-4 border-primary">
        <CardContent className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{session.title}</h1>
              <p className="text-sm text-muted-foreground">
                Session overview
              </p>
            </div>
            <Badge className="capitalize">{session.type}</Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <Info label="Date Range">
              {session.start_date} → {session.end_date}
            </Info>
            <Info label="Time">{session.time}</Info>
            <Info label="Active Days">
              <p className="capitalize">{session.days.join(", ")}</p>
            </Info>
          </div>
        </CardContent>
      </Card>

      {/* ================= SESSION DAYS ================= */}
      <div className="space-y-8">
        {session.scheduling.map((day) => (
          <div key={day.id} className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-2 top-0 h-full w-px bg-border" />

            {/* Timeline dot */}
            <div className="absolute left-0 top-3 h-4 w-4 rounded-full bg-primary" />

            <Card>
              <CardContent className="p-6 space-y-4">
                {/* Day Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {day.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {day.date}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="secondary">{day.level}</Badge>
                    <Badge variant="outline">
                      {day.duration}
                    </Badge>
                  </div>
                </div>

                {day.description && (
                  <p className="text-sm text-muted-foreground">
                    {day.description}
                  </p>
                )}

                <Separator />

                {/* Exercises Table */}
                <div className="space-y-2">
                  {day.exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center rounded-md px-3 py-2 hover:bg-muted/40 transition"
                    >
                      <div className="sm:col-span-2">
                        <p className="font-medium">
                          {ex.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ex.categories}
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {ex.duration}s
                      </div>

                      <div className="text-right">
                        <Badge
                          variant={
                            ex.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {ex.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-medium">{children}</p>
    </div>
  );
}
