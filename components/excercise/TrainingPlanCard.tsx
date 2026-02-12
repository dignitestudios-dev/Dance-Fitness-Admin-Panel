import { useState } from "react";
import { Eye, Pencil, Trash } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { API } from "@/lib/api/axios";
import { toast } from "sonner";
import { TrainingPlan } from "./types";
import { S3_BUCKET_URL, ALL_CATEGORIES, LEVELS } from "./constants";
import { getImageUrl, toggleArrayItem } from "./utils";
import CategorySelector from "./CategorySelector";

interface TrainingPlanCardProps {
  plan: TrainingPlan;
  onClick: () => void;
  onUpdated?: () => void;
}

export default function TrainingPlanCard({
  plan,
  onClick,
  onUpdated,
}: TrainingPlanCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================= EDIT STATE =================
  const [title, setTitle] = useState(plan.title);
  const [description, setDescription] = useState(plan.description);
  const [categories, setCategories] = useState<string[]>([...plan.categories]);
  const [level, setLevel] = useState(plan.level);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    getImageUrl(plan.cover_image, S3_BUCKET_URL, "")
  );

  // ================= DELETE PLAN =================
  const handleDelete = async () => {
    try {
      setLoading(true);
      await API.delete(`/admin/training-plans/${plan.id}`);
      toast.success("Training plan deleted!");
      setShowDeleteConfirm(false);
      onUpdated?.();
            window.location.reload(); // Force reload to update cover image

    } catch (err) {
      console.error(err);
      toast.error("Failed to delete training plan");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT PLAN =================
  const handleEditSubmit = async () => {
    if (!title || !description || !level || categories.length === 0) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("training_plan_id", String(plan.id));
      formData.append("title", title);
      formData.append("description", description);
      formData.append("level", level);
      categories.forEach((c) => formData.append("categories[]", c));
      if (coverImage) formData.append("cover_image", coverImage);

      await API.post("/admin/training-plans/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Training plan updated!");
      setShowEditModal(false);
      onUpdated?.();
      window.location.reload(); // Force reload to update cover image
    } catch (err) {
      console.error(err);
      toast.error("Failed to update training plan");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCoverImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <>
      {/* ================= CARD ================= */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 relative">
        {plan.cover_image && (
          <div
            className="relative w-full h-40 bg-gray-100 cursor-pointer"
            onClick={onClick}
          >
            <img
              src={getImageUrl(
                plan.cover_image,
                S3_BUCKET_URL,
                "https://placehold.co/400x200?text=No+Cover"
              )}
              alt={plan.title}
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        <CardHeader
          className="pb-1 pl-6 cursor-pointer"
          onClick={onClick}
        >
          <CardTitle className="text-lg font-semibold">
            {plan.title}
          </CardTitle>
          <div className="text-sm font-medium text-gray-700">
            Exercises: {plan.exercises.length}
          </div>
        </CardHeader>

        <CardContent className="flex justify-between items-center">
          

          <div className="flex gap-2">

             <Button
              size="sm"
              variant="outline"
                          onClick={onClick}

            >
              <Eye className="h-4 w-4" />
              View
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>



            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ================= DELETE CONFIRM ================= */}
      {showDeleteConfirm && (
        <Dialog open={true} onOpenChange={() => setShowDeleteConfirm(false)}>
          <DialogContent className="sm:max-w-sm w-full p-6">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{plan.title}"?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <Dialog open={true} onOpenChange={() => setShowEditModal(false)}>
          <DialogContent className="sm:max-w-lg w-full p-6">
            <DialogHeader>
              <DialogTitle>Edit Training Plan</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />

              {/* Category Selector */}
              <CategorySelector
                categories={ALL_CATEGORIES}
                selectedCategories={categories}
                onToggle={(cat) =>
                  toggleArrayItem(cat, categories, setCategories)
                }
              />

              {/* Level */}
              <div>
                <div className="text-sm font-medium mb-1">Level</div>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
              />

              {/* Cover Image */}
              <div>
                <div className="text-sm font-medium mb-1">Cover Image</div>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                )}
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </div>

              <Button
                className="w-full"
                onClick={handleEditSubmit}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Plan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
