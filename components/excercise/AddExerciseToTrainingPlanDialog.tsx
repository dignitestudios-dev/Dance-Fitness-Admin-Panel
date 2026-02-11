import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { API } from "@/lib/api/axios";
import { toast } from "sonner";
import CategorySelector from "./CategorySelector";
import TagSelector from "./TagSelector";
import { ALL_CATEGORIES, ALL_TAGS, LEVELS } from "./constants";
import { formatDuration, toggleArrayItem } from "./utils";
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
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseCategories, setExerciseCategories] = useState<string[]>([]);
  const [exerciseLevel, setExerciseLevel] = useState("");
  const [exerciseDescription, setExerciseDescription] = useState("");
  const [exerciseTags, setExerciseTags] = useState<string[]>([]);
  const [exerciseEquipment, setExerciseEquipment] = useState<string[]>([]);
  const [exerciseType, setExerciseType] = useState<"on_demand" | "regular" | "">("");
  const [exerciseVideoFile, setExerciseVideoFile] = useState<File | null>(null);
  // const [exerciseThumbnailFile, setExerciseThumbnailFile] = useState<File | null>(null);
  const [exerciseVideoDuration, setExerciseVideoDuration] = useState("");

  const handleExerciseVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExerciseVideoFile(file);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      setExerciseVideoDuration(formatDuration(video.duration));
    };
    video.src = URL.createObjectURL(file);
  };

  // const handleExerciseThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files?.[0]) setExerciseThumbnailFile(e.target.files[0]);
  // };

  const resetForm = () => {
    setExerciseTitle("");
    setExerciseCategories([]);
    setExerciseLevel("");
    setExerciseDescription("");
    setExerciseTags([]);
    setExerciseEquipment([]);
    setExerciseVideoFile(null);
    // setExerciseThumbnailFile(null);
    setExerciseVideoDuration("");
    setExerciseType("");
  };

  const handleAddExerciseToPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) {
      toast.error("No training plan selected!");
      return;
    }
    if (!exerciseVideoFile) {
      toast.error("Video is required!");
      return;
    }

    if (
      !exerciseTitle ||
      exerciseCategories.length === 0 ||
      !exerciseLevel ||
      !exerciseDescription ||
      exerciseTags.length === 0 ||
      exerciseEquipment.length === 0 
      // !exerciseThumbnailFile
    ) {
      toast.error("Please fill all required fields for the exercise.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("training_plan_id", plan.id.toString());
      formData.append("title", exerciseTitle);
      exerciseCategories.forEach((c) => formData.append("categories[]", c));
      formData.append("level", exerciseLevel);
      formData.append("description", exerciseDescription);
      exerciseTags.forEach((t) => formData.append("tags[]", t));
      exerciseEquipment.forEach((eq) => formData.append("equipment[]", eq));
      formData.append("video", exerciseVideoFile);
      formData.append("video_duration", exerciseVideoDuration);
      // formData.append("thumbnail", exerciseThumbnailFile as Blob);
      formData.append("type", exerciseType);

      await API.post("/admin/training-plans/add-exercise", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Exercise added to training plan!");
      resetForm();
      onOpenChange(false);
      onSuccess();
      window.location.reload(); // Reload to reflect changes
    } catch (err) {
      console.error(err);
      toast.error("Failed to add exercise to plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add Exercise to {plan?.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleAddExerciseToPlan} className="space-y-3 mt-2">
          <Input
            placeholder="Title"
            value={exerciseTitle}
            onChange={(e) => setExerciseTitle(e.target.value)}
            required
          />

          <CategorySelector
            categories={ALL_CATEGORIES}
            selectedCategories={exerciseCategories}
            onToggle={(cat) => toggleArrayItem(cat, exerciseCategories, setExerciseCategories)}
          />

          <Select value={exerciseLevel} onValueChange={setExerciseLevel} required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent className="w-full">
              {LEVELS.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Description"
            value={exerciseDescription}
            onChange={(e) => setExerciseDescription(e.target.value)}
            required
          />

          <TagSelector
            tags={ALL_TAGS}
            selectedTags={exerciseTags}
            onToggle={(tag) => toggleArrayItem(tag, exerciseTags, setExerciseTags)}
          />

          <Input
            placeholder="Equipment (comma separated)"
            value={exerciseEquipment.join(", ")}
            onChange={(e) =>
              setExerciseEquipment(e.target.value.split(",").map((eq) => eq.trim()))
            }
            required
          />

          <h1>Video</h1>
          <Input type="file" accept="video/*" onChange={handleExerciseVideoChange} required />
          {exerciseVideoDuration && (
            <Input value={exerciseVideoDuration} disabled placeholder="Video duration auto-detected" />
          )}

          {/* <h1>Thumbnail</h1>
          <Input type="file" accept="image/*" onChange={handleExerciseThumbnailChange} required /> */}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Adding..." : "Add Exercise"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
