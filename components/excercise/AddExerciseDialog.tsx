import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddExerciseDialog({ open, onOpenChange, onSuccess }: AddExerciseDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  // const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState("");
  const [type, setType] = useState<"on_demand" | "regular" | "">("");

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      setVideoDuration(formatDuration(video.duration));
    };
    video.src = URL.createObjectURL(file);
  };

  // const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files?.[0]) setThumbnailFile(e.target.files[0]);
  // };

  const resetForm = () => {
    setTitle("");
    setCategories([]);
    setLevel("");
    setDescription("");
    setTags([]);
    setEquipment([]);
    setVideoFile(null);
    // setThumbnailFile(null);
    setVideoDuration("");
    setType("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!videoFile || !type || !thumbnailFile) {
    //   toast.error("Please fill all required fields");
    //   return;
    // }
    
    if (!videoFile || !type) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!title || categories.length === 0 || !level || !description || tags.length === 0 || equipment.length === 0) {
      toast.error("Please fill all required fields for the exercise.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      categories.forEach((c) => formData.append("categories[]", c));
      formData.append("level", level);
      formData.append("description", description);
      tags.forEach((t) => formData.append("tags[]", t));
      equipment.forEach((eq) => formData.append("equipment[]", eq));
      formData.append("video", videoFile);
      formData.append("video_duration", videoDuration);
      // formData.append("thumbnail", thumbnailFile as Blob);
      formData.append("type", type);

      await API.post("/admin/add-exercise", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Exercise added successfully!");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add exercise");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Add New Exercise</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1 mt-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <CategorySelector
            categories={ALL_CATEGORIES}
            selectedCategories={categories}
            onToggle={(cat) => toggleArrayItem(cat, categories, setCategories)}
          />

          <Select value={level} onValueChange={setLevel} required>
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

          <Select
            value={type}
            onValueChange={(value: string) => setType(value as "on_demand" | "regular" | "")}
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Exercise Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ondemand">On Demand</SelectItem>
              <SelectItem value="regular">Exercise</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <TagSelector
            tags={ALL_TAGS}
            selectedTags={tags}
            onToggle={(tag) => toggleArrayItem(tag, tags, setTags)}
          />

          <Input
            placeholder="Equipment (comma separated)"
            value={equipment.join(", ")}
            onChange={(e) => setEquipment(e.target.value.split(",").map((eq) => eq.trim()))}
            required
          />

          <h1>Video</h1>
          <Input type="file" accept="video/*" onChange={handleVideoChange} required />
          {videoDuration && (
            <Input
              value={videoDuration}
              disabled
              placeholder="Video duration will be detected automatically"
            />
          )}

          {/* <h1>Thumbnail</h1>
          <Input type="file" accept="image/*" onChange={handleThumbnailChange} required /> */}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Adding..." : "Add Exercise"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
