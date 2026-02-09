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
import { ALL_CATEGORIES, LEVELS } from "./constants";
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
  const [planTitle, setPlanTitle] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planCategories, setPlanCategories] = useState<string[]>([]);
  const [planLevel, setPlanLevel] = useState("");
  const [planCoverImage, setPlanCoverImage] = useState<File | null>(null);

  const handlePlanCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPlanCoverImage(e.target.files[0]);
  };

  const resetForm = () => {
    setPlanTitle("");
    setPlanDescription("");
    setPlanCategories([]);
    setPlanLevel("");
    setPlanCoverImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!planTitle || !planLevel || planCategories.length === 0 || !planCoverImage || !planDescription) {
      toast.error("Please fill all required fields!");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", planTitle);
      formData.append("description", planDescription);
      planCategories.forEach((c) => formData.append("categories[]", c));
      formData.append("level", planLevel);
      formData.append("cover_image", planCoverImage as Blob);

      await API.post("/admin/training-plans/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Training plan created successfully!");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error("Failed to create training plan:", err);
      toast.error("Failed to create training plan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <Plus className="mr-2 h-4 w-4" /> Add Training Plan
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Create Training Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1 mt-2">
          <Input
            placeholder="Title"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            required
          />

          <CategorySelector
            categories={ALL_CATEGORIES}
            selectedCategories={planCategories}
            onToggle={(cat) => toggleArrayItem(cat, planCategories, setPlanCategories)}
          />

          <Select value={planLevel} onValueChange={setPlanLevel} required>
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
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            required
          />

          <div>
            <div className="text-sm font-medium mb-1">Cover Image</div>
            <Input type="file" accept="image/*" onChange={handlePlanCoverImageChange} required />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create Plan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
