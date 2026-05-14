"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";

import { API } from "@/lib/api/axios";
import { toast } from "sonner";

import CategorySelector from "./CategorySelector";
import TagSelector from "./TagSelector";

import { ALL_CATEGORIES, ALL_TAGS, LEVELS } from "./constants";
import { toggleArrayItem } from "./utils";

interface AddTrainingPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddTrainingPlanDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTrainingPlanDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [level, setLevel] = useState("");

  const [exerciseIds, setExerciseIds] = useState<number[]>([]);

  const [showOnSite, setShowOnSite] = useState(true);
  const [exerciseIdsInput, setExerciseIdsInput] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategories([]);
    setTags([]);
    setLevel("");
    setExerciseIds([]);
    setShowOnSite(true);
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (
    !title ||
    !description ||
    !level ||
    categories.length === 0 ||
    tags.length === 0
  ) {
    toast.error("Please fill all required fields");
    return;
  }

  setSubmitting(true);

  try {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("level", level);
    formData.append("show_on_site", String(showOnSite));

    categories.forEach((c) =>
      formData.append("categories[]", c)
    );

    tags.forEach((t) =>
      formData.append("tags[]", t)
    );

    // ✅ FIX: convert input → array here
    const parsedExerciseIds = exerciseIdsInput
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);

    parsedExerciseIds.forEach((id) =>
      formData.append("exercises[]", String(id))
    );

    await API.post(
      "/admin/training-plans/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Training plan created!");

    resetForm();
    onOpenChange(false);
    onSuccess();
  } catch (err) {
    console.error(err);
    toast.error("Failed to create training plan");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Training Plan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Create Training Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* TITLE */}
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* DESCRIPTION */}
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />


          {/* CATEGORY (IDENTICAL TO EXERCISE MODAL) */}
          <CategorySelector
            categories={ALL_CATEGORIES}
            selectedCategories={categories}
            onToggle={(cat) =>
              toggleArrayItem(cat, categories, setCategories)
            }
          />

          {/* TAGS (IDENTICAL COMPONENT) */}
          <TagSelector
            tags={ALL_TAGS}
            selectedTags={tags}
            onToggle={(tag) =>
              toggleArrayItem(tag, tags, setTags)
            }
          />

          {/* EXERCISE IDS (same style as Video ID) */}
<div>
  <div className="text-sm font-medium mb-2">
    Exercise IDs
  </div>

  <Input
    placeholder="e.g. 12, 45, 78"
    value={exerciseIdsInput}
    onChange={(e) => setExerciseIdsInput(e.target.value)}
  />

  <p className="text-xs text-muted-foreground mt-1">
    Enter comma-separated exercise IDs (same style as Video ID input)
  </p>
</div>

          {/* LEVEL (IDENTICAL STYLE) */}
         <Select value={level} onValueChange={setLevel}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select Level" />
  </SelectTrigger>

  <SelectContent>
    {LEVELS.map((lvl) => (
      <SelectItem key={lvl} value={lvl}>
        {lvl}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          {/* SHOW ON SITE */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <label className="text-sm font-medium">
              Show on Site
            </label>

            <Checkbox
              checked={showOnSite}
              onCheckedChange={(checked) =>
                setShowOnSite(!!checked)
              }
            />
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Training Plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}