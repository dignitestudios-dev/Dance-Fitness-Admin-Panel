"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import ExerciseCard from "@/components/excercise/ExerciseCard";
import TrainingPlanCard from "@/components/excercise/TrainingPlanCard";
import AddExerciseDialog from "@/components/excercise/AddExerciseDialog";
import AddTrainingPlanDialog from "@/components/excercise/AddTrainingPlanDialog";
import TrainingPlanModal from "@/components/excercise/TrainingPlanModal";
import AddExerciseToTrainingPlanDialog from "@/components/excercise/AddExerciseToTrainingPlanDialog";
import DeleteExerciseDialog from "@/components/excercise/DeleteExerciseDialog";
import EditExerciseDialog from "@/components/excercise/EditExerciseDialog";
import Pagination from "@/components/excercise/Pagination";

import {
  Exercise,
  TrainingPlan,
  PaginatedExercises,
  TrainingPlanPagination,
} from "@/components/excercise/types";

type Tab = "regular" | "ondemand" | "training-plans";

export default function ExercisesPage() {
  const [regularExercises, setRegularExercises] = useState<Exercise[]>([]);
  const [ondemandExercises, setOndemandExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [paginationRegular, setPaginationRegular] =
    useState<PaginatedExercises>({
      current_page: 1,
      data: [],
      last_page: 1,
      next_page_url: null,
      prev_page_url: null,
    });

  const [paginationOndemand, setPaginationOndemand] =
    useState<PaginatedExercises>({
      current_page: 1,
      data: [],
      last_page: 1,
      next_page_url: null,
      prev_page_url: null,
    });

  const [activeTab, setActiveTab] = useState<Tab>("regular");
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  // View Details
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] =
    useState<Exercise | null>(null);

  // Training plans
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [trainingPlansPagination, setTrainingPlansPagination] =
    useState<TrainingPlanPagination | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);

  // Dialogs
  const [addExerciseDialogOpen, setAddExerciseDialogOpen] = useState(false);
  const [addTrainingPlanDialogOpen, setAddTrainingPlanDialogOpen] =
    useState(false);
  const [
    addExerciseToTrainingPlanDialogOpen,
    setAddExerciseToTrainingPlanDialogOpen,
  ] = useState(false);
  const [planForExercise, setPlanForExercise] =
    useState<TrainingPlan | null>(null);

  const fetchExercises = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/exercises", { params: { page } });

      setRegularExercises(res.data.regular.data);
      setPaginationRegular(res.data.regular);

      setOndemandExercises(res.data.ondemand.data);
      setPaginationOndemand(res.data.ondemand);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingPlans = async (page: number = 1) => {
    try {
      const res = await API.get("/admin/training-plans", { params: { page } });
      setTrainingPlans(res.data.data);
      setTrainingPlansPagination(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExercise = async (id: number) => {
    try {
      await API.delete(`/admin/exercises/${id}`);
      setRegularExercises((p) => p.filter((e) => e.id !== id));
      setOndemandExercises((p) => p.filter((e) => e.id !== id));
      toast.success("Exercise deleted");
      setDeleteOpen(false);
      window.location.reload(); // Temporary fix to refresh pagination after deletion
    } catch {
      toast.error("Delete failed");
    }
  };

  const openExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setDetailsOpen(true);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (activeTab === "training-plans" && trainingPlans.length === 0) {
      fetchTrainingPlans();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center min-h-[60vh] items-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <div className="flex gap-2">
          <AddExerciseDialog
            open={addExerciseDialogOpen}
            onOpenChange={setAddExerciseDialogOpen}
            onSuccess={() => fetchExercises(paginationRegular.current_page)}
          />
          <AddTrainingPlanDialog
            open={addTrainingPlanDialogOpen}
            onOpenChange={setAddTrainingPlanDialogOpen}
            onSuccess={() =>
              fetchTrainingPlans(trainingPlansPagination?.current_page || 1)
            }
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {["regular", "ondemand", "training-plans"].map((tab) => (
          <Button
            key={tab}
            variant="outline"
            onClick={() => setActiveTab(tab as Tab)}
            className={
              activeTab === tab ? "bg-[#D32C86] text-white" : ""
            }
          >
            {tab === "regular"
              ? "Exercises"
              : tab === "ondemand"
              ? "On Demand"
              : "Training Plans"}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {activeTab !== "training-plans" &&
          (activeTab === "regular"
            ? regularExercises
            : ondemandExercises
          ).map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              playingId={playingId}
              onPlay={() => setPlayingId(ex.id)}
              onView={() => openExerciseDetails(ex)}
              onEdit={() => {
                setEditingExercise(ex);
                setEditOpen(true);
              }}
              onDelete={() => {
                setDeletingId(ex.id);
                setDeleteOpen(true);
              }}
            />
          ))}

        {activeTab === "training-plans" &&
          trainingPlans.map((plan) => (
            <TrainingPlanCard
              key={plan.id}
              plan={plan}
              onClick={() => setSelectedPlan(plan)}
            />
          ))}
      </div>

      {/* Pagination */}
      {activeTab === "regular" && paginationRegular.last_page > 1 && (
        <Pagination
          currentPage={paginationRegular.current_page}
          lastPage={paginationRegular.last_page}
          hasNext={!!paginationRegular.next_page_url}
          hasPrev={!!paginationRegular.prev_page_url}
          onPageChange={(page) => {
            void fetchExercises(page);
          }}
        />
      )}

      {activeTab === "ondemand" && paginationOndemand.last_page > 1 && (
        <Pagination
          currentPage={paginationOndemand.current_page}
          lastPage={paginationOndemand.last_page}
          hasNext={!!paginationOndemand.next_page_url}
          hasPrev={!!paginationOndemand.prev_page_url}
          onPageChange={(page) => {
            void fetchExercises(page);
          }}
        />
      )}

      {/* Exercise Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Exercise Details</DialogTitle>
          </DialogHeader>

          {selectedExercise && (
  <div className="space-y-4">

    {/* VIDEO (if exists) */}
{/* {selectedExercise.url && (
  <video
    key={selectedExercise.id}
    src={selectedExercise.url}
    controls
    className="w-full rounded-md"
  />
)} */}



    {/* Exercise details */}
    <div className="space-y-3 text-sm">
    {(() => {
      const detailKeys: Array<keyof Exercise> = [
        "title",
        "categories",
        "level",
        "tags",
      ];
      return detailKeys.map((key) => {
        const value = (selectedExercise as Exercise)[key];
        return (
          <div key={String(key)} className="flex gap-2">
            <span className="font-semibold capitalize">
              {String(key).replace(/_/g, " ")}:
            </span>
            <span className="text-muted-foreground break-all">
              {Array.isArray(value)
                ? (value as any).join(", ")
                : typeof value === "object"
                ? JSON.stringify(value)
                : String(value)}
            </span>
          </div>
        );
      });
    })()}
</div>

  </div>
)}

        </DialogContent>
      </Dialog>

      {/* Other dialogs */}
      <EditExerciseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        exercise={editingExercise}
        onSuccess={() =>
          fetchExercises(
            activeTab === "regular"
              ? paginationRegular.current_page
              : paginationOndemand.current_page
          )
        }
      />

      <DeleteExerciseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (deletingId) {
            await handleDeleteExercise(deletingId);
          }
        }}
      />

      <TrainingPlanModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onAddExercise={(plan) => {
          setPlanForExercise(plan);
          setAddExerciseToTrainingPlanDialogOpen(true);
        }}
      />

      <AddExerciseToTrainingPlanDialog
        open={addExerciseToTrainingPlanDialogOpen}
        onOpenChange={setAddExerciseToTrainingPlanDialogOpen}
        plan={planForExercise}
        onSuccess={() =>
          fetchTrainingPlans(trainingPlansPagination?.current_page || 1)
        }
      />
    </div>
  );
}
