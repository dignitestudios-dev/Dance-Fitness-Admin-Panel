import { useState } from "react";
import { Eye, Pencil, Trash } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { API } from "@/lib/api/axios";
import { toast } from "sonner";

import { TrainingPlan } from "./types";

import {
  ALL_CATEGORIES,
  LEVELS,
} from "./constants";

import { toggleArrayItem } from "./utils";

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
  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(plan.title);

  const [description, setDescription] =
    useState(plan.description || "");

  const [categories, setCategories] =
    useState<string[]>(plan.categories || []);

  const [level, setLevel] =
    useState(plan.level || "");

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(plan.cover_image || null);

  const handleDelete = async () => {
    try {
      setLoading(true);

      await API.delete(
        `/admin/training-plans/${plan.id}`
      );

      toast.success(
        "Training plan deleted!"
      );

      setShowDeleteConfirm(false);

      onUpdated?.();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to delete training plan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (
      !title ||
      !description ||
      !level ||
      categories.length === 0
    ) {
      toast.error(
        "Please fill all required fields!"
      );

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "training_plan_id",
        String(plan.id)
      );

      formData.append("title", title);

      formData.append(
        "description",
        description
      );

      formData.append("level", level);

      categories.forEach((c) =>
        formData.append(
          "categories[]",
          c
        )
      );

      if (coverImage) {
        formData.append(
          "cover_image",
          coverImage
        );
      }

      await API.post(
        "/admin/training-plans/edit",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        "Training plan updated!"
      );

      setShowEditModal(false);

      onUpdated?.();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to update training plan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) {
      setCoverImage(e.target.files[0]);

      setPreview(
        URL.createObjectURL(
          e.target.files[0]
        )
      );
    }
  };

  return (
    <>
 <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white group">
  {/* Thumbnail */}
  <div
    className="relative aspect-video w-full overflow-hidden cursor-pointer bg-slate-100"
    onClick={onClick}
  >
    <img
      src={
        plan.image ||
        "https://placehold.co/600x400?text=No+Image"
      }
      alt={plan.title}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={(e) => {
        (
          e.currentTarget as HTMLImageElement
        ).src =
          "https://placehold.co/600x400?text=No+Image";
      }}
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300" />

    {/* Hover Button */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <Eye className="h-4 w-4" />

        <span className="text-sm font-medium">
          View Plan
        </span>
      </div>
    </div>

    {/* Exercise Count */}
    <div className="absolute top-3 right-3">
      <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
        {plan.exercise_count || 0} Exercises
      </div>
    </div>
  </div>

  {/* Content */}
  <CardContent className="p-4">
    {/* Title */}
    <h2
      className="font-bold text-sm leading-tight line-clamp-2 min-h-[40px] mb-3 text-slate-800 cursor-pointer"
      onClick={onClick}
    >
      {plan.title}
    </h2>

    {/* Meta */}
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <span className="bg-[#D32C86] text-white text-[10px] px-2 py-1 rounded-full font-medium">
        {plan.level}
      </span>

      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
        {plan.exercise_count || 0} Exercises
      </span>
    </div>

    {/* Categories */}
    {plan.categories?.length > 0 && (
      <div className="flex flex-wrap gap-1 mb-4">
        {plan.categories
          .slice(0, 3)
          .map((cat) => (
            <span
              key={cat}
              className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600"
            >
              {cat}
            </span>
          ))}
      </div>
    )}

    {/* Actions */}
    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
      <button
        onClick={onClick}
        className="text-slate-500 hover:text-[#D32C86] transition-colors"
      >
        <Eye className="h-4 w-4" />
      </button>

      <div className="flex gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowEditModal(true);
          }}
          className="text-slate-500 hover:text-blue-600 transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="text-slate-400 hover:text-red-600 transition-colors"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  </CardContent>
</Card>

      {/* DELETE MODAL */}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={
          setShowDeleteConfirm
        }
      >
        <DialogContent className="sm:max-w-sm w-full p-6">
          <DialogHeader>
            <DialogTitle>
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to
            delete "{plan.title}"?
          </p>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setShowDeleteConfirm(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      <Dialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
      >
        <DialogContent className="sm:max-w-lg w-full p-6">
          <DialogHeader>
            <DialogTitle>
              Edit Training Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Title"
            />

            <CategorySelector
              categories={ALL_CATEGORIES}
              selectedCategories={
                categories
              }
              onToggle={(cat) =>
                toggleArrayItem(
                  cat,
                  categories,
                  setCategories
                )
              }
            />

            <div>
              <div className="text-sm font-medium mb-1">
                Level
              </div>

              <Select
                value={level}
                onValueChange={setLevel}
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
            </div>

            <Textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Description"
            />

            <div>
              <div className="text-sm font-medium mb-1">
                Cover Image
              </div>

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}

              <Input
                type="file"
                accept="image/*"
                onChange={
                  handleImageChange
                }
              />
            </div>

            <Button
              className="w-full"
              onClick={handleEditSubmit}
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}