import { useState, useEffect } from "react";
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
  const [categories, setCategories] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  // const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [type, setType] = useState<"ondemand" | "regular" | "">("");

  // Populate form when exercise changes
  useEffect(() => {
    if (exercise) {
      setTitle(exercise.title);
      setCategories(Array.isArray(exercise.categories) ? exercise.categories : [exercise.categories]);
      setLevel(exercise.level);
      setDescription(""); // Description not available in current Exercise type
      
      // Parse tags if they're stored as string
      if (exercise.tags) {
        try {
          const parsedTags = typeof exercise.tags === 'string' 
            ? JSON.parse(exercise.tags) 
            : exercise.tags;
          setTags(Array.isArray(parsedTags) ? parsedTags : []);
        } catch {
          setTags([]);
        }
      } else {
        setTags([]);
      }
      
      setEquipment([]); // Equipment not available in current Exercise type
      setType(exercise.type);
      // setThumbnailFile(null);
    }
  }, [exercise]);

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
    // setThumbnailFile(null);
    setType("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exercise) {
      toast.error("No exercise selected");
      return;
    }

    if (!title || categories.length === 0 || !level || !type) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      categories.forEach((c) => formData.append("categories[]", c));
      formData.append("level", level);
      if (description) formData.append("description", description);
      tags.forEach((t) => formData.append("tags[]", t));
      equipment.forEach((eq) => formData.append("equipment[]", eq));
      formData.append("type", type);
      
      // Only append thumbnail if a new one is selected
      // if (thumbnailFile) {
      //   formData.append("thumbnail", thumbnailFile);
      // }

      // Note: Video is NOT included as per requirements
      await API.put(`/admin/exercises/${exercise.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Exercise updated successfully!");
      resetForm();
      onOpenChange(false);
      onSuccess();
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

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
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
            onValueChange={(value: string) => setType(value as "ondemand" | "regular" | "")}
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
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TagSelector
            tags={ALL_TAGS}
            selectedTags={tags}
            onToggle={(tag) => toggleArrayItem(tag, tags, setTags)}
          />

          <Input
            placeholder="Equipment (comma separated, optional)"
            value={equipment.join(", ")}
            onChange={(e) => setEquipment(e.target.value.split(",").map((eq) => eq.trim()).filter(Boolean))}
          />

          {/* <div>
            <div className="text-sm font-medium mb-1">Thumbnail (optional - leave empty to keep current)</div>
            <Input type="file" accept="image/*" onChange={handleThumbnailChange} />
            {exercise.thumbnail && !thumbnailFile && (
              <p className="text-xs text-gray-500 mt-1">Current thumbnail will be kept if not changed</p>
            )}
          </div> */}

          {/* <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Video cannot be edited. Only metadata and thumbnail can be updated.
            </p>
          </div> */}

        <div className="flex justify-end gap-2">
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
    {submitting ? "Updating..." : "Update"}
  </Button>
</div>

        </form>
      </DialogContent>
    </Dialog>
  );
}
