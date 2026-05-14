import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash,
  PlayCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [planDetails, setPlanDetails] =
    useState<any>(null);

  // FETCH PLAN DETAILS
  useEffect(() => {
    const fetchPlanDetails = async () => {
      if (!plan?.id) return;

      try {
        setLoading(true);

        const res = await API.get(
          `/admin/training-plans/${plan.id}`
        );

        setPlanDetails(res.data.data);
      } catch (err) {
        console.error(err);

        toast.error(
          "Failed to load training plan details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetails();
  }, [plan]);

  if (!plan) return null;

  const details = planDetails || plan;

  // DELETE PLAN
  const handleDeletePlan = async () => {
    try {
      await API.delete(
        `/admin/training-plans/${plan.id}`
      );

      toast.success(
        "Training plan deleted!"
      );

      setShowDeleteConfirm(false);

      onUpdated?.();

      onClose();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to delete training plan"
      );
    }
  };

  return (
    <>
      {/* MAIN MODAL */}
      <Dialog
        open={!!plan}
        onOpenChange={() => onClose()}
      >
        <DialogContent className="sm:max-w-3xl w-full max-h-[85vh] overflow-y-auto p-0">
          {/* HEADER */}
          <div className="bg-white border-b p-4 flex items-start gap-4">
            {/* Thumbnail */}
            {details.cover_image && (
              <img
                src={details.cover_image}
                alt={details.title}
                className="w-28 h-20 object-cover rounded-lg border shrink-0"
              />
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    {details.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-[#D32C86] text-white text-[10px]">
                      {details.level}
                    </Badge>

                    <span className="text-xs text-slate-500">
                      {
                        details.exercises?.length || 0
                      }{" "}
                      Exercises
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setShowEditModal(
                        true
                      )
                    }
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setShowDeleteConfirm(
                        true
                      )
                    }
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mt-3 line-clamp-3">
                {details.description ||
                  "No description available"}
              </p>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mt-3">
                {details.categories?.map(
                  (
                    cat: string,
                    idx: number
                  ) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[10px]"
                    >
                      {cat}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="bg-white p-4 space-y-4">
            {/* EXERCISE LIST */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">
                  Exercises
                </h3>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onAddExercise(
                      details
                    )
                  }
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  Loading exercises...
                </div>
              ) : details.exercises
                  ?.length > 0 ? (
                <div className="border rounded-lg overflow-hidden divide-y bg-white">
                  {details.exercises.map(
                    (
                      exercise: any
                    ) => (
                      <div
                        key={
                          exercise.id
                        }
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-24 h-14 rounded overflow-hidden bg-slate-100 shrink-0">
                          {exercise.thumbnail_url ? (
                            <img
                              src={
                                exercise.thumbnail_url
                              }
                              alt={
                                exercise.title
                              }
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PlayCircle className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">
                            {
                              exercise.title
                            }
                          </h4>

                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="text-[10px] bg-[#D32C86] text-white">
                              {
                                exercise.level
                              }
                            </Badge>

                            {exercise.categories?.[0] && (
                              <span className="text-[10px] text-slate-500 uppercase">
                                {
                                  exercise.categories[0]
                                }
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Play */}
                        {exercise.video_url && (
                          <a
                            href={
                              exercise.video_url
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-[#D32C86]"
                          >
                            <PlayCircle className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground border rounded-lg p-4 text-center">
                  No exercises found.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditTrainingPlanModal
          plan={details}
          onClose={() =>
            setShowEditModal(false)
          }
          onUpdated={() => {
            setShowEditModal(false);

            onUpdated?.();
          }}
        />
      )}

      {/* DELETE MODAL */}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={
          setShowDeleteConfirm
        }
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to
            delete "{details.title}"?
          </p>

          <div className="flex justify-end gap-2 pt-4">
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
              onClick={
                handleDeletePlan
              }
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ======================================================
   EDIT TRAINING PLAN MODAL
====================================================== */

function EditTrainingPlanModal({
  plan,
  onClose,
  onUpdated,
}: {
  plan: TrainingPlan;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [title, setTitle] =
    useState(plan.title);

  const [description, setDescription] =
    useState(plan.description || "");

  const [categories, setCategories] =
    useState<string[]>(
      plan.categories || []
    );

  const [level, setLevel] =
    useState(plan.level || "");

  const [coverImage, setCoverImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(
      plan.cover_image || null
    );

  const [loading, setLoading] =
    useState(false);

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

  const handleSubmit = async () => {
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

      const formData =
        new FormData();

      formData.append(
        "training_plan_id",
        String(plan.id)
      );

      formData.append(
        "title",
        title
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "level",
        level
      );

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

      onUpdated();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to update training plan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Edit Training Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
            placeholder="Title"
          />

          <CategorySelector
            categories={
              ALL_CATEGORIES
            }
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
              onValueChange={
                setLevel
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>

              <SelectContent>
                {LEVELS.map(
                  (lvl) => (
                    <SelectItem
                      key={lvl}
                      value={lvl}
                    >
                      {lvl}
                    </SelectItem>
                  )
                )}
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
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}