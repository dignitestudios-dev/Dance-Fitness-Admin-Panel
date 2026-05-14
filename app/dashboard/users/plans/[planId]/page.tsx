"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API } from "@/lib/api/axios";
import {
  Loader2,
  Dumbbell,
  Tag,
  Layers3,
  PlayCircle,
} from "lucide-react";

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
  id: string;
  title: string;
  level: string;
  categories: string[];
  tags: string[];
  video_url: string;
}

interface PlanDetails {
  id: string;
  title: string;
  description: string;
  level: string;
  image: string;
  categories: string[];
  tags: string[];
  exercise_count: number;
  is_saved: boolean;
  exercises: Exercise[];
}

interface ApiResponse {
  status: boolean;
  message: string;
  data: PlanDetails;
}

/* ================= COMPONENT ================= */

export default function PlanDetailsPage() {
  const params = useParams<{ planId: string }>();
  const planId = params.planId;

  const [plan, setPlan] = useState<PlanDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!planId) return;

    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      const res = await API.get<ApiResponse>(
        `/admin/training-plans/${planId}`
      );

      setPlan(res.data.data);
    } catch (error) {
      console.error("Plan details API error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-destructive text-lg">
          Failed to load training plan
        </p>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8">
      {/* ================= HERO ================= */}

      <Card className="overflow-hidden border-0 shadow-md">
        {/* IMAGE */}

        <div className="relative h-65 md:h-90 overflow-hidden">
          <img
            src={plan.image}
            alt={plan.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute bottom-0 left-0 p-6 text-white w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-primary text-white">
                {plan.level}
              </Badge>

              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-none"
              >
                {plan.exercise_count} Exercises
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">
              {plan.title}
            </h1>

            <p className="text-sm md:text-base text-white/90 mt-2 max-w-3xl">
              {plan.description}
            </p>
          </div>
        </div>

        {/* PLAN DETAILS */}

        <CardContent className="p-6 space-y-6">
          {/* Categories */}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers3 className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Categories</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {plan.categories.map((category, index) => (
                <Badge key={index} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tags */}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Tags</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {plan.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= EXERCISES ================= */}

      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold">
            Exercises
          </h2>

          <p className="text-muted-foreground text-sm">
            {plan.exercise_count} exercise
            {plan.exercise_count > 1 ? "s" : ""} included
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {plan.exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-5 space-y-4">
                {/* HEADER */}

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {exercise.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{exercise.level}</Badge>
                    </div>
                  </div>

                  {exercise.video_url && (
                    <a
                      href={exercise.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <PlayCircle className="h-8 w-8" />
                    </a>
                  )}
                </div>

                <Separator />

                {/* CATEGORIES */}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layers3 className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Categories
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exercise.categories.map((category, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* TAGS */}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      Focus Areas
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {exercise.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}