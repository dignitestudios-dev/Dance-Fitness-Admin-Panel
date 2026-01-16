"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { API } from "@/lib/api/axios";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ================= TYPES ================= */

interface Exercise {
  id: number;
  title: string;
  duration: string;
  level: string;
  equipment: string;
}

interface PlanDetails {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  total_exercises: number;
  equipments: string[];
  is_favorite: boolean;
  exercises: Exercise[];
}

/* ================= COMPONENT ================= */

export default function PlanDetailsPage() {
  // MUST match folder names: [id] and [planId]
  const params = useParams<{ planId: string }>();
  const planId = params.planId;
  const searchParams = useSearchParams();
const userId = searchParams.get("userId");


  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if(userId) {

    fetchPlanDetails();
  }
  }, [planId]);

  const fetchPlanDetails = async () => {
      try {
        const res = await API.get(
          "/admin/user/plans/plan-details",
          {
            params: {
              user_uid: userId,      // 👈 EXACT key required by API
              plan_id: planId,   // 👈 EXACT key required by API
            },
          }
        );

        setPlan(res.data);
      } catch (error) {
        console.error("Plan details API error:", error);
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

  if (!plan) {
    return <p className="text-destructive">Failed to load plan details</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{plan.title}</CardTitle> 
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">{plan.description}</p>

          <div className="flex gap-2 flex-wrap">
            <Badge>{plan.level}</Badge>
            <Badge variant="secondary">
              {plan.total_exercises} Exercises
            </Badge>
            <Badge variant="outline">{plan.duration}</Badge>
          </div>

          <Separator />

          <div>
            <p className="font-medium">Equipments</p>
            <p className="text-sm text-muted-foreground">
              {plan.equipments.join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.exercises.map((ex) => (
            <div key={ex.id} className="border rounded-md p-3">
              <p className="font-medium">{ex.title}</p>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <span>{ex.duration}</span>
                <span>•</span>
                <span>{ex.level}</span>
                <span>•</span>
                <span>{ex.equipment}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
