"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCcw,
} from "lucide-react";

import { API } from "@/lib/api/axios";

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

import DeleteExerciseDialog from "@/components/excercise/DeleteExerciseDialog";

import EditExerciseDialog from "@/components/excercise/EditExerciseDialog";

import {
  Exercise,
  TrainingPlan,
  PaginatedExercises,
} from "@/components/excercise/types";

type Tab =
  | "regular"
  | "ondemand"

const SmartPagination = ({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  onPageChange: (
    p: number
  ) => void;
}) => {
  const getPages = () => {
    const pages: (
      | number
      | string
    )[] = [];

    const range = 1;

    for (
      let i = 1;
      i <= lastPage;
      i++
    ) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >=
          currentPage -
            range &&
          i <=
            currentPage +
              range)
      ) {
        pages.push(i);
      } else if (
        i ===
          currentPage -
            range -
            1 ||
        i ===
          currentPage +
            range +
            1
      ) {
        if (
          !pages.includes(
            "..."
          )
        )
          pages.push("...");
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-12">
      <Button
        variant="outline"
        size="icon"
        disabled={
          currentPage === 1
        }
        onClick={() =>
          onPageChange(
            currentPage - 1
          )
        }
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {getPages().map(
          (page, i) =>
            page ===
            "..." ? (
              <MoreHorizontal
                key={`sep-${i}`}
                className="h-4 w-4 text-muted-foreground mx-1"
              />
            ) : (
              <Button
                key={i}
                variant={
                  currentPage ===
                  page
                    ? "default"
                    : "outline"
                }
                className={
                  currentPage ===
                  page
                    ? "bg-[#D32C86] hover:bg-[#D32C86]/90"
                    : "w-10"
                }
                onClick={() =>
                  onPageChange(
                    page as number
                  )
                }
              >
                {page}
              </Button>
            )
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        disabled={
          currentPage ===
          lastPage
        }
        onClick={() =>
          onPageChange(
            currentPage + 1
          )
        }
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function ExercisesPage() {
  const [
    regularExercises,
    setRegularExercises,
  ] = useState<
    Exercise[]
  >([]);

  const [
    ondemandExercises,
    setOndemandExercises,
  ] = useState<
    Exercise[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [
    paginationRegular,
    setPaginationRegular,
  ] =
    useState<PaginatedExercises>(
      {
        current_page: 1,
        data: [],
        last_page: 1,
        next_page_url: null,
        prev_page_url: null,
      }
    );

  const [
    paginationOndemand,
    setPaginationOndemand,
  ] =
    useState<PaginatedExercises>(
      {
        current_page: 1,
        data: [],
        last_page: 1,
        next_page_url: null,
        prev_page_url: null,
      }
    );

  const [activeTab, setActiveTab] =
    useState<Tab>("regular");

  const [playingId, setPlayingId] =
    useState<number | null>(
      null
    );

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<number | null>(
      null
    );

  const [editOpen, setEditOpen] =
    useState(false);

  const [
    editingExercise,
    setEditingExercise,
  ] =
    useState<Exercise | null>(
      null
    );

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [
    selectedExercise,
    setSelectedExercise,
  ] =
    useState<Exercise | null>(
      null
    );

  // const [
  //   trainingPlans,
  //   setTrainingPlans,
  // ] = useState<
  //   TrainingPlan[]
  // >([]);

  // const [selectedPlan, setSelectedPlan] =
  //   useState<TrainingPlan | null>(
  //     null
  //   );

  const [
    addExerciseOpen,
    setAddExerciseOpen,
  ] = useState(false);

  // Normalize Vimeo URLs
  const normalizeData = (
    data: any[]
  ) =>
    (data || []).map(
      (item) => {
        let url =
          item.video_url ||
          item.video ||
          "";

        if (
          url.includes(
            "vimeo.com"
          ) &&
          !url.includes(
            "player.vimeo.com"
          )
        ) {
          const id =
            url
              .split("/")
              .pop();

          url = `https://player.vimeo.com/video/${id}`;
        }

        return {
          ...item,
          id: Number(item.id),
          video_url: url,
        };
      }
    );

  // FETCH EXERCISES
 const fetchExercises = async (
  page: number = 1,
  refresh: boolean = true
) => {
  setLoading(true);

  try {
    const res = await API.get("/admin/exercises", {
      params: {
        page,
        per_page: 12, // ✅ ADD THIS
        refresh,
      },
    });

    const { regular, ondemand } = res.data;

    // Regular
    setRegularExercises(normalizeData(regular.data));

    setPaginationRegular({
      ...regular,
      last_page: regular.total_pages,
    });

    // Ondemand
    setOndemandExercises(normalizeData(ondemand.data));

    setPaginationOndemand({
      ...ondemand,
      last_page: ondemand.total_pages,
    });

    if (refresh) {
      toast.success("Exercises refreshed successfully");
    }
  } catch (err) {
    toast.error("Failed to sync data");
  } finally {
    setLoading(false);
  }
};

  // FETCH TRAINING PLANS
  // const fetchTrainingPlans =
  //   async (
  //     page: number = 1
  //   ) => {
  //     try {
  //       const res =
  //         await API.get(
  //           "/admin/training-plans",
  //           {
  //             params: {
  //               page,
  //             },
  //           }
  //         );

  //       setTrainingPlans(
  //         res.data.data
  //       );
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  useEffect(() => {
    fetchExercises();
  }, []);

  // useEffect(() => {
  //   if (
  //     activeTab ===
  //       "training-plans" &&
  //     trainingPlans.length === 0
  //   ) {
  //     fetchTrainingPlans();
  //   }
  // }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">
          Exercise Management
        </h1>

        <div className="flex gap-2 flex-wrap">
          {/* Refresh */}
          <Button
            variant="outline"
            disabled={loading}
            onClick={() =>
              fetchExercises(
                activeTab ===
                  "regular"
                  ? paginationRegular.current_page
                  : paginationOndemand.current_page,
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

          {/* Add Exercise */}
          <AddExerciseDialog
            open={
              addExerciseOpen
            }
            onOpenChange={
              setAddExerciseOpen
            }
            onSuccess={() =>
              fetchExercises()
            }
          />

          {/* Add Training Plan */}
          {/* <AddTrainingPlanDialog
            onSuccess={() =>
              fetchTrainingPlans()
            }
          /> */}
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            "regular",
            "ondemand",
            
          ] as const
        ).map((tab) => (
          <Button
            key={tab}
            variant="outline"
            onClick={() => {
              setActiveTab(
                tab
              );

              setPlayingId(
                null
              );
            }}
            className={
              activeTab === tab
                ? "bg-[#D32C86] text-white hover:bg-[#D32C86]/90 hover:text-white"
                : ""
            }
          >
           {tab === "regular"
  ? "Exercises"
  : "On Demand"}
          </Button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin h-8 w-8 text-[#D32C86]" />
        </div>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Regular */}
            {activeTab ===
              "regular" &&
              regularExercises.map(
                (ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    playingId={
                      playingId
                    }
                    onPlay={() =>
                      setPlayingId(
                        ex.id
                      )
                    }
                    onView={() => {
                      setSelectedExercise(
                        ex
                      );

                      setDetailsOpen(
                        true
                      );
                    }}
                    onEdit={() => {
                      setEditingExercise(
                        ex
                      );

                      setEditOpen(
                        true
                      );
                    }}
                    onDelete={() => {
                      setDeletingId(
                        ex.id
                      );

                      setDeleteOpen(
                        true
                      );
                    }}
                  />
                )
              )}

            {/* Ondemand */}
            {activeTab ===
              "ondemand" &&
              ondemandExercises.map(
                (ex) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    playingId={
                      playingId
                    }
                    onPlay={() =>
                      setPlayingId(
                        ex.id
                      )
                    }
                    onView={() => {
                      setSelectedExercise(
                        ex
                      );

                      setDetailsOpen(
                        true
                      );
                    }}
                    onEdit={() => {
                      setEditingExercise(
                        ex
                      );

                      setEditOpen(
                        true
                      );
                    }}
                    onDelete={() => {
                      setDeletingId(
                        ex.id
                      );

                      setDeleteOpen(
                        true
                      );
                    }}
                  />
                )
              )}

            {/* Training Plans */}
            {/* {activeTab ===
              "training-plans" &&
              trainingPlans.map(
                (plan) => (
                  <TrainingPlanCard
                    key={plan.id}
                    plan={plan}
                    onClick={() =>
                      setSelectedPlan(
                        plan
                      )
                    }
                  />
                )
              )} */}
          </div>

          {/* PAGINATION */}
          {activeTab ===
            "regular" &&
            paginationRegular.last_page >
              1 && (
              <SmartPagination
                currentPage={
                  paginationRegular.current_page
                }
                lastPage={
                  paginationRegular.last_page
                }
                onPageChange={
                  fetchExercises
                }
              />
            )}

          {activeTab ===
            "ondemand" &&
            paginationOndemand.last_page >
              1 && (
              <SmartPagination
                currentPage={
                  paginationOndemand.current_page
                }
                lastPage={
                  paginationOndemand.last_page
                }
                onPageChange={
                  fetchExercises
                }
              />
            )}
        </>
      )}

      {/* DETAILS MODAL */}
      <Dialog
        open={detailsOpen}
        onOpenChange={
          setDetailsOpen
        }
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {
                selectedExercise?.title
              }
            </DialogTitle>
          </DialogHeader>

          {selectedExercise && (
            <div className="space-y-4">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`${selectedExercise?.video_url}?autoplay=0&title=0&byline=0&portrait=0`}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-sm">
                  Description
                </h4>

                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {selectedExercise.description ||
                    "No description available."}
                </p>

                <div className="flex gap-4 pt-4 text-xs font-medium border-t">
                  <span>
                    Level:{" "}
                    {
                      selectedExercise.level
                    }
                  </span>

                  <span className="text-[#D32C86]">
                    Category:{" "}
                    {Array.isArray(
                      selectedExercise.categories
                    )
                      ? selectedExercise.categories[0]
                      : selectedExercise.categories}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT */}
      <EditExerciseDialog
        open={editOpen}
        onOpenChange={
          setEditOpen
        }
        exercise={
          editingExercise
        }
        onSuccess={() =>
          fetchExercises(
            activeTab ===
              "regular"
              ? paginationRegular.current_page
              : paginationOndemand.current_page
          )
        }
      />

      {/* DELETE */}
      <DeleteExerciseDialog
        open={deleteOpen}
        onOpenChange={
          setDeleteOpen
        }
        onConfirm={async () => {
          if (!deletingId)
            return;

          try {
            await API.delete(
              `/admin/exercises/${deletingId}`
            );

            toast.success(
              "Deleted successfully"
            );

            setDeleteOpen(
              false
            );

            fetchExercises();
          } catch {
            toast.error(
              "Failed to delete"
            );
          }
        }}
      />

      {/* TRAINING PLAN MODAL */}
      {/* <TrainingPlanModal
        plan={selectedPlan}
        onClose={() =>
          setSelectedPlan(
            null
          )
        }
        onAddExercise={(
          plan
        ) => {
          console.log(
            "Add exercise to",
            plan
          );
        }}
      /> */}
    </div>
  );
}