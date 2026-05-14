import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

import {
  ALL_CATEGORIES,
  ALL_TAGS,
  LEVELS,
} from "./constants";

import { toggleArrayItem } from "./utils";
import { Exercise } from "./types";

interface EditExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise | null;
  onSuccess: () => void;
}

export default function EditExerciseDialog({
  open,
  onOpenChange,
  exercise,
  onSuccess,
}: EditExerciseDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoId, setVideoId] = useState("");

  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [level, setLevel] = useState("");

  const [showOnHomePage, setShowOnHomePage] = useState(false);
  const [showOnWatchOnDemand, setShowOnWatchOnDemand] = useState(false);

  useEffect(() => {
    if (!exercise) return;

    setTitle(exercise.title || "");

    setDescription(exercise.description || "");

    setVideoId(
      exercise.video?.split("/").pop() ||
      exercise.video_url?.split("/").pop() ||
      ""
    );

    setCategories(
      Array.isArray(exercise.categories)
        ? exercise.categories
        : exercise.categories
        ? [exercise.categories]
        : []
    );

    if (exercise.tags) {
      try {
        const parsed =
          typeof exercise.tags === "string"
            ? JSON.parse(exercise.tags)
            : exercise.tags;

        setTags(Array.isArray(parsed) ? parsed : []);
      } catch {
        setTags([]);
      }
    } else {
      setTags([]);
    }

    setLevel(exercise.level || "");

    setShowOnHomePage(
      Boolean(exercise.show_on_home_page)
    );

    setShowOnWatchOnDemand(
      Boolean(exercise.show_on_watch_on_demand)
    );
  }, [exercise]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoId("");
    setCategories([]);
    setTags([]);
    setLevel("");
    setShowOnHomePage(false);
    setShowOnWatchOnDemand(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exercise) {
      toast.error("No exercise selected");
      return;
    }

    if (
      !title ||
      !description ||
      !videoId ||
      categories.length === 0 ||
      tags.length === 0 ||
      !level
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        video_id: videoId,
        categories,
        tags,
        level,
        show_on_home_page: showOnHomePage,
        show_on_watch_on_demand: showOnWatchOnDemand,
      };

      await API.put(
        `/admin/exercises/${exercise.id}`,
        payload
      );

      toast.success("Exercise updated successfully!");

      resetForm();

      onSuccess();

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update exercise");
    } finally {
      setSubmitting(false);
    }
  };

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Exercise</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-2"
        >
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            required
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            required
          />

          <Input
            placeholder="Video ID"
            value={videoId}
            onChange={(e) =>
              setVideoId(e.target.value)
            }
            required
          />

          <CategorySelector
            categories={ALL_CATEGORIES}
            selectedCategories={categories}
            onToggle={(cat) =>
              toggleArrayItem(
                cat,
                categories,
                setCategories
              )
            }
          />

          <TagSelector
            tags={ALL_TAGS}
            selectedTags={tags}
            onToggle={(tag) =>
              toggleArrayItem(
                tag,
                tags,
                setTags
              )
            }
          />

          <Select
            value={level}
            onValueChange={setLevel}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>

            <SelectContent>
              {LEVELS.map((lvl) => (
                <SelectItem
                  key={lvl}
                  value={lvl}
                >
                  {lvl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between rounded-md border p-3">
            <label className="text-sm font-medium">
              Show on Home Page
            </label>

            <Checkbox
              checked={showOnHomePage}
              onCheckedChange={(checked) =>
                setShowOnHomePage(!!checked)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <label className="text-sm font-medium">
              Show on Watch On Demand
            </label>

            <Checkbox
              checked={showOnWatchOnDemand}
              onCheckedChange={(checked) =>
                setShowOnWatchOnDemand(!!checked)
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={submitting}
            >
              {submitting
                ? "Updating..."
                : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}