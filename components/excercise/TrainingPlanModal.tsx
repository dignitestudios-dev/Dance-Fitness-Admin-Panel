import { useState } from "react";
import { Plus, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { API } from "@/lib/api/axios";
import { toast } from "sonner";
import { TrainingPlan } from "./types";
import { S3_BUCKET_URL, ALL_CATEGORIES, LEVELS } from "./constants";
import { getImageUrl, getVideoUrl, toggleArrayItem } from "./utils";
import CategorySelector from "./CategorySelector";

interface TrainingPlanModalProps {
  plan: TrainingPlan | null;
  onClose: () => void;
  onAddExercise: (plan: TrainingPlan) => void;
  onUpdated?: () => void;
}

export default function TrainingPlanModal({
  plan,
  onClose,
  onAddExercise,
  onUpdated,
}: TrainingPlanModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const [showExerciseDeleteConfirm, setShowExerciseDeleteConfirm] = useState(false);

  if (!plan) return null;

  // Delete Training Plan
  const handleDeletePlan = async () => {
    try {
      await API.delete(`/admin/training-plans/${plan.id}`);
      toast.success("Training plan deleted!");
      setShowDeleteConfirm(false);
      onUpdated?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete training plan");
    }
  };

  // Delete Exercise
  const handleDeleteExercise = async () => {
    if (!exerciseToDelete) return;

    try {
      await API.delete(`/admin/exercises/${exerciseToDelete}`);
      toast.success("Exercise deleted!");
      setShowExerciseDeleteConfirm(false);
      onUpdated?.();
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete exercise");
    }
  };

  return (
    <>
      {/* ================= MAIN VIEW MODAL ================= */}
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl w-full max-h-[80vh] overflow-y-auto p-0">
          <div className="bg-white rounded-t-xl p-6 border-b flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
              <div className="flex flex-wrap gap-2 mb-2">
                {plan.categories.map((cat, idx) => (
                  <Badge key={idx}>#{cat}</Badge>
                ))}
                <Badge variant="secondary">{plan.level}</Badge>
              </div>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>

          <div className="bg-white p-6 pt-0 space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold">Exercise List</h1>
              <Button variant="outline" onClick={() => onAddExercise(plan)}>
                <Plus className="mr-2 h-4 w-4" /> Add Exercise
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {plan.exercises.map((ex) => (
                <div key={ex.id} className="flex flex-col border rounded-lg p-3">
                  {ex.url ? ( 
                    <video controls className="w-full h-40 object-cover rounded-lg mb-2">
                      <source src={getVideoUrl(ex.url, S3_BUCKET_URL)} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={getImageUrl(ex.thumbnail, S3_BUCKET_URL, "https://placehold.co/160x160")}
                      className="w-full h-40 object-cover rounded-lg mb-2"
                      alt={ex.title}
                    />
                  )}
                  <p className="text-sm font-semibold">{ex.title}</p>
                  <p className="text-xs text-gray-500">{ex.duration} • {ex.level}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setExerciseToDelete(ex.id);
                        setShowExerciseDeleteConfirm(true);
                      }}
                    >
                      <Trash className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <EditTrainingPlanModal
          plan={plan}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => {
            setShowEditModal(false);
            onUpdated?.();
          }}
        />
      )}

      {/* ================= DELETE CONFIRMATION FOR PLAN ================= */}
      {showDeleteConfirm && (
        <Dialog open={true} onOpenChange={() => setShowDeleteConfirm(false)}>
          <DialogContent className="sm:max-w-sm w-full p-6">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the training plan "{plan.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePlan}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ================= DELETE CONFIRMATION FOR EXERCISE ================= */}
      {showExerciseDeleteConfirm && (
        <Dialog open={true} onOpenChange={() => setShowExerciseDeleteConfirm(false)}>
          <DialogContent className="sm:max-w-sm w-full p-6">
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this exercise? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowExerciseDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteExercise}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

/* =======================================================
   EDIT MODAL WITH CATEGORYSELECTOR (like AddTrainingPlanDialog)
======================================================= */
function EditTrainingPlanModal({
  plan,
  onClose,
  onUpdated,
}: {
  plan: TrainingPlan;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [title, setTitle] = useState(plan.title);
  const [description, setDescription] = useState(plan.description);
  const [categories, setCategories] = useState<string[]>([...plan.categories]);
  const [level, setLevel] = useState(plan.level);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    getImageUrl(plan.cover_image, S3_BUCKET_URL, "")
  );
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCoverImage(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async () => {
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
      onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update training plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg w-full p-6">
        <DialogHeader>
          <DialogTitle>Edit Training Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />

          {/* CATEGORY SELECTOR */}
          <CategorySelector
            categories={ALL_CATEGORIES}
            selectedCategories={categories}
            onToggle={(cat) => toggleArrayItem(cat, categories, setCategories)}
          />

          {/* LEVEL */}
          <div>
            <div className="text-sm font-medium mb-1">Level</div>
            <Select value={level} onValueChange={setLevel}>
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
          </div>

          {/* Description */}
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />

          {/* Cover Image */}
          <div>
            <div className="text-sm font-medium mb-1">Cover Image</div>
            {preview && <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded mb-2" />}
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
