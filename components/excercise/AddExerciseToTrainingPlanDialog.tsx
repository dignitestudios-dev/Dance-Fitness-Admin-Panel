"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { API } from "@/lib/api/axios";
import { toast } from "sonner";
import { TrainingPlan } from "./types";

interface AddExerciseToTrainingPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: TrainingPlan | null;
  onSuccess: () => void;
}

export default function AddExerciseToTrainingPlanDialog({
  open,
  onOpenChange,
  plan,
  onSuccess,
}: AddExerciseToTrainingPlanDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  // 👇 user input (comma separated)
  const [exerciseIdsInput, setExerciseIdsInput] = useState("");

  const handleAddExerciseToPlan = async () => {
    if (!plan) {
      toast.error("No training plan selected!");
      return;
    }

    // convert "1,2,3" → [1,2,3]
    const exerciseIds = exerciseIdsInput
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id));

    if (exerciseIds.length === 0) {
      toast.error("Please enter valid exercise IDs");
      return;
    }

    try {
      setSubmitting(true);

      await API.post(
        `/admin/training-plans/${plan.id}/add-exercise`,
        {
          exercise_ids: exerciseIds,
        }
      );

      toast.success("Exercises added to training plan!");

      setExerciseIdsInput("");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add exercises to plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            Add Exercises to {plan?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter exercise IDs separated by commas (e.g. 12244, 12245)
          </p>

          {/* INPUT */}
          <input
            type="text"
            value={exerciseIdsInput}
            onChange={(e) => setExerciseIdsInput(e.target.value)}
            placeholder="e.g. 12244, 12245"
            className="w-full border rounded-md px-3 py-2 text-sm"
          />

          {/* PREVIEW */}
          {exerciseIdsInput && (
            <div className="text-xs text-muted-foreground">
              Will add:{" "}
              {exerciseIdsInput
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean)
                .join(", ")}
            </div>
          )}

          {/* BUTTON */}
          <Button
            className="w-full"
            onClick={handleAddExerciseToPlan}
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Exercises"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}