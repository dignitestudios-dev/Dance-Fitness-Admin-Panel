"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";

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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

interface Exercise {
  id: number;
  title: string;
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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  const [showOnSite, setShowOnSite] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoadingExercises(true);

        const res = await API.get("/admin/exercise/list");

        setExercises(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch exercises");
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchExercises();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategories([]);
    setTags([]);
    setLevel("");
    setExerciseIds([]);
    setShowOnSite(true);
  };

  const handleExerciseToggle = (id: number) => {
    setExerciseIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
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

      exerciseIds.forEach((id) =>
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

          {/* CATEGORY */}
          <CategorySelector
            categories={ALL_CATEGORIES}
            selectedCategories={categories}
            onToggle={(cat) =>
              toggleArrayItem(cat, categories, setCategories)
            }
          />

          {/* TAGS */}
          <TagSelector
            tags={ALL_TAGS}
            selectedTags={tags}
            onToggle={(tag) =>
              toggleArrayItem(tag, tags, setTags)
            }
          />

          {/* EXERCISE DROPDOWN */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Exercises
            </label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full justify-between"
                >
                  {exerciseIds.length > 0
                    ? `${exerciseIds.length} exercise(s) selected`
                    : "Choose exercises"}

                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className="w-[350px] p-3"
                align="start"
              >
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {loadingExercises ? (
                    <p className="text-sm text-muted-foreground">
                      Loading exercises...
                    </p>
                  ) : exercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No exercises found
                    </p>
                  ) : (
                    exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={exerciseIds.includes(
                            exercise.id
                          )}
                          onCheckedChange={() =>
                            handleExerciseToggle(exercise.id)
                          }
                        />

                        <label className="text-sm cursor-pointer">
                          {exercise.title}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {exerciseIds.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Selected IDs: {exerciseIds.join(", ")}
              </div>
            )}
          </div>

          {/* LEVEL */}
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