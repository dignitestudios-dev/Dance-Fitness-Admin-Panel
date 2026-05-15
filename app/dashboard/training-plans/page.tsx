"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { API } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import TrainingPlanCard from "@/components/excercise/TrainingPlanCard";
import AddTrainingPlanDialog from "@/components/excercise/AddTrainingPlanDialog";
import TrainingPlanModal from "@/components/excercise/TrainingPlanModal";
import AddExerciseToTrainingPlanDialog from "@/components/excercise/AddExerciseToTrainingPlanDialog";

import { TrainingPlan } from "@/components/excercise/types";

import {
  ALL_CATEGORIES,
  ALL_TAGS,
  LEVELS,
} from "@/components/excercise/constants";

export default function TrainingPlansPage() {
  const [loading, setLoading] = useState(true);

  const [trainingPlans, setTrainingPlans] =
    useState<TrainingPlan[]>([]);

  const [selectedPlan, setSelectedPlan] =
    useState<TrainingPlan | null>(null);

  const [addExerciseOpen, setAddExerciseOpen] =
    useState(false);

  const [selectedExerciseId, setSelectedExerciseId] =
    useState<number | null>(null);

  const [addPlanOpen, setAddPlanOpen] =
    useState(false);

  // FILTERS
  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [selectedTags, setSelectedTags] =
    useState<string[]>([]);

  const [selectedLevel, setSelectedLevel] =
    useState("");

  // Pagination state
  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [perPage, setPerPage] =
    useState(12);

  const [hasMore, setHasMore] =
    useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedTags([]);
    setSelectedLevel("");
  };

  const fetchTrainingPlans = async (
    page: number = 1,
    refresh: boolean = false
  ) => {
    setLoading(true);

    try {
      const params: any = {
        page,
        refresh,
        per_page: perPage,
      };

      // CATEGORY
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      // LEVEL
      if (selectedLevel) {
        params.level = selectedLevel;
      }

      // TAGS[]
      if (selectedTags.length > 0) {
        params["tags[]"] = selectedTags;
      }

      const res = await API.get(
        "/admin/training-plans",
        {
          params,
        }
      );

      const data = res.data;

      setTrainingPlans(data.data || []);

      setCurrentPage(data.current_page || 1);

      setTotalPages(data.total_pages || 1);

      setPerPage(data.per_page || 12);

      setHasMore(data.has_more || false);

      if (refresh) {
        toast.success(
          "Training plans refreshed successfully"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to fetch training plans"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingPlans(1);
  }, [
    selectedCategory,
    selectedTags,
    selectedLevel,
  ]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchTrainingPlans(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchTrainingPlans(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Training Plans
          </h1>

          {/* <p className="text-sm text-muted-foreground">
            Create, manage and organize
            training programs
          </p> */}
        </div>

        <div className="flex gap-2">

          {/* REFRESH */}
          <Button
            variant="outline"
            disabled={loading}
            onClick={() =>
              fetchTrainingPlans(
                currentPage,
                true
              )
            }
            className="border-[#D32C86] text-[#D32C86] hover:bg-[#D32C86] hover:text-white"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh
          </Button>

          {/* ADD PLAN */}
          <AddTrainingPlanDialog
            open={addPlanOpen}
            onOpenChange={setAddPlanOpen}
            onSuccess={() =>
              fetchTrainingPlans(currentPage)
            }
          />
        </div>
      </div>

      {/* FILTERS */}
      {/* FILTERS */}
<div className="rounded-2xl border bg-white p-5 shadow-sm space-y-5">

  {/* TOP BAR */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    
    <div>
      <h2 className="text-lg font-semibold">
        Filters
      </h2>

      <p className="text-sm text-muted-foreground">
        Filter training plans by category, level and tags
      </p>
    </div>

    {(selectedCategory ||
      selectedLevel ||
      selectedTags.length > 0) && (
      <Button
        variant="outline"
        size="sm"
        onClick={clearFilters}
        className="w-fit"
      >
        <X className="h-4 w-4 mr-2" />
        Clear Filters
      </Button>
    )}
  </div>

  {/* FILTER GRID */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

    {/* CATEGORY */}
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Category
      </label>

      <Select
        value={selectedCategory}
        onValueChange={setSelectedCategory}
      >
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>

        <SelectContent>
          {ALL_CATEGORIES.map((category) => (
            <SelectItem
              key={category}
              value={category}
            >
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* LEVEL */}
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Level
      </label>

      <Select
        value={selectedLevel}
        onValueChange={setSelectedLevel}
      >
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Select level" />
        </SelectTrigger>

        <SelectContent>
          {LEVELS.map((level) => (
            <SelectItem
              key={level}
              value={level}
            >
              {level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* TAGS */}
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Tags
      </label>

      <Select
        onValueChange={(value) => {
          if (!selectedTags.includes(value)) {
            setSelectedTags((prev) => [
              ...prev,
              value,
            ]);
          }
        }}
      >
        <SelectTrigger className="h-11">
          <SelectValue placeholder="Select tags" />
        </SelectTrigger>

        <SelectContent>
          {ALL_TAGS.map((tag) => (
            <SelectItem
              key={tag}
              value={tag}
            >
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

  </div>

  {/* SELECTED FILTERS */}
  {(selectedCategory ||
    selectedLevel ||
    selectedTags.length > 0) && (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Active Filters
        </h3>

        <span className="text-xs text-muted-foreground">
          {selectedTags.length +
            (selectedCategory ? 1 : 0) +
            (selectedLevel ? 1 : 0)}{" "}
          selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2">

        {/* CATEGORY */}
        {selectedCategory && (
          <Badge
            variant="secondary"
            className="h-8 px-3 rounded-full flex items-center gap-2"
          >
            <span className="font-medium">
              Category:
            </span>

            {selectedCategory}

            <button
              type="button"
              onClick={() =>
                setSelectedCategory("")
              }
              className="hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {/* LEVEL */}
        {selectedLevel && (
          <Badge
            variant="secondary"
            className="h-8 px-3 rounded-full flex items-center gap-2"
          >
            <span className="font-medium">
              Level:
            </span>

            {selectedLevel}

            <button
              type="button"
              onClick={() =>
                setSelectedLevel("")
              }
              className="hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}

        {/* TAGS */}
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="h-8 px-3 rounded-full flex items-center gap-2"
          >
            {tag}

            <button
              type="button"
              onClick={() =>
                setSelectedTags((prev) =>
                  prev.filter(
                    (t) => t !== tag
                  )
                )
              }
              className="hover:text-red-500 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

      </div>
    </div>
  )}
</div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin h-8 w-8 text-[#D32C86]" />
        </div>
      ) : trainingPlans.length === 0 ? (
        <div className="border rounded-xl p-10 text-center text-muted-foreground">
          No training plans found.
        </div>
      ) : (
        <>

          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            {trainingPlans.map((plan) => (
              <TrainingPlanCard
                key={plan.id}
                plan={plan}
                onClick={() =>
                  setSelectedPlan(plan)
                }
              />
            ))}

          </div>

          {/* PAGINATION */}
          <div className="flex justify-end items-center gap-2 mt-4">

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={
                currentPage <= 1 ||
                loading
              }
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of{" "}
              {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={
                !hasMore || loading
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

          </div>

        </>
      )}

      {/* TRAINING PLAN MODAL */}
      <TrainingPlanModal
        plan={selectedPlan}
        onClose={() =>
          setSelectedPlan(null)
        }
        onAddExercise={(plan) => {
          setSelectedExerciseId(null);
          setAddExerciseOpen(true);
        }}
      />

      {/* ADD EXERCISE */}
      {selectedPlan && (
        <AddExerciseToTrainingPlanDialog
          open={addExerciseOpen}
          onOpenChange={
            setAddExerciseOpen
          }
          plan={selectedPlan}
          onSuccess={() =>
            fetchTrainingPlans(
              currentPage
            )
          }
        />
      )}
    </div>
  );
}