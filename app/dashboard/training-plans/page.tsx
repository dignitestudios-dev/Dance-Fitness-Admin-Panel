"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";

import { API } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import TrainingPlanCard from "@/components/excercise/TrainingPlanCard";
import AddTrainingPlanDialog from "@/components/excercise/AddTrainingPlanDialog";
import TrainingPlanModal from "@/components/excercise/TrainingPlanModal";
import AddExerciseToTrainingPlanDialog from "@/components/excercise/AddExerciseToTrainingPlanDialog";

import { TrainingPlan } from "@/components/excercise/types";

export default function TrainingPlansPage() {
  const [loading, setLoading] = useState(true);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);

  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const [addPlanOpen, setAddPlanOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(false);

  const fetchTrainingPlans = async (page: number = 1, refresh: boolean = false) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/training-plans", {
        params: { page, refresh },
      });

      const data = res.data;
      setTrainingPlans(data.data || []);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.total_pages || 1);
      setPerPage(data.per_page || 10);
      setHasMore(data.has_more || false);

      if (refresh) {
        toast.success("Training plans refreshed successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch training plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingPlans();
  }, []);

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
          <h1 className="text-2xl font-bold">Training Plans</h1>
          <p className="text-sm text-muted-foreground">
            Create, manage and organize training programs
          </p>
        </div>

        <div className="flex gap-2">
          {/* Refresh */}
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => fetchTrainingPlans(currentPage, true)}
            className="border-[#D32C86] text-[#D32C86] hover:bg-[#D32C86] hover:text-white"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {/* Add Training Plan */}
          <AddTrainingPlanDialog 
            open={addPlanOpen} 
            onOpenChange={setAddPlanOpen} 
            onSuccess={() => fetchTrainingPlans(currentPage)} 
          />
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin h-8 w-8 text-[#D32C86]" />
        </div>
      ) : trainingPlans.length === 0 ? (
        <div className="border rounded-xl p-10 text-center text-muted-foreground">
          No training plans found. Create your first plan to get started.
        </div>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trainingPlans.map((plan) => (
              <TrainingPlanCard
                key={plan.id}
                plan={plan}
                onClick={() => setSelectedPlan(plan)}
              />
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasMore || loading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}

      {/* TRAINING PLAN DETAILS MODAL */}
      <TrainingPlanModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onAddExercise={(plan) => {
          setSelectedExerciseId(null);
          setAddExerciseOpen(true);
        }}
      />

      {/* ADD EXERCISE TO PLAN MODAL */}
      {selectedPlan && (
        <AddExerciseToTrainingPlanDialog
          open={addExerciseOpen}
          onOpenChange={setAddExerciseOpen}
          plan={selectedPlan}
          onSuccess={() => fetchTrainingPlans(currentPage)}
        />
      )}
    </div>
  );
}