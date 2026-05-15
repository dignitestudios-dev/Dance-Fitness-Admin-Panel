"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCcw,
  X,
} from "lucide-react";

import { API } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";

import ExerciseCard from "@/components/excercise/ExerciseCard";
import AddExerciseDialog from "@/components/excercise/AddExerciseDialog";
import EditExerciseDialog from "@/components/excercise/EditExerciseDialog";
import DeleteExerciseDialog from "@/components/excercise/DeleteExerciseDialog";

import {
  Exercise,
  PaginatedExercises,
} from "@/components/excercise/types";

import {
  ALL_CATEGORIES,
  ALL_TAGS,
  LEVELS,
} from "@/components/excercise/constants";

type Tab = "regular" | "ondemand";

/* ================= PAGINATION ================= */

const SmartPagination = ({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  onPageChange: (p: number) => void;
}) => {
  const getPages = () => {
    const pages: (number | string)[] = [];
    const range = 1;

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        pages.push(i);
      } else if (
        i === currentPage - range - 1 ||
        i === currentPage + range + 1
      ) {
        if (!pages.includes("...")) pages.push("...");
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-12">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {getPages().map((page, i) =>
          page === "..." ? (
            <MoreHorizontal
              key={`sep-${i}`}
              className="h-4 w-4 text-muted-foreground mx-1"
            />
          ) : (
            <Button
              key={i}
              variant={currentPage === page ? "default" : "outline"}
              className={
                currentPage === page
                  ? "bg-[#D32C86] hover:bg-[#D32C86]/90"
                  : "w-10"
              }
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

/* ================= PAGE ================= */

export default function ExercisesPage() {
  const [regularExercises, setRegularExercises] = useState<Exercise[]>([]);
  const [ondemandExercises, setOndemandExercises] = useState<Exercise[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("regular");

  const [paginationRegular, setPaginationRegular] = useState<PaginatedExercises>({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  const [paginationOndemand, setPaginationOndemand] = useState<PaginatedExercises>({
    current_page: 1,
    data: [],
    last_page: 1,
    next_page_url: null,
    prev_page_url: null,
  });

  const [playingId, setPlayingId] = useState<number | null>(null);

  const [addExerciseOpen, setAddExerciseOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  /* ================= FILTERS ================= */

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedLevel("");
    setSelectedTags([]);
  };

  /* ================= NORMALIZER ================= */

  const normalizeData = (data: any[]) =>
    (data || []).map((item) => {
      let url = item.video_url || item.video || "";

      if (url.includes("vimeo.com") && !url.includes("player.vimeo.com")) {
        const id = url.split("/").pop();
        url = `https://player.vimeo.com/video/${id}`;
      }

      return {
        ...item,
        id: Number(item.id),
        video_url: url,
      };
    });

  /* ================= FETCH ================= */

  const fetchExercises = async (page: number = 1, refresh: boolean = true) => {
    setLoading(true);

    try {
      const params: any = {
        page,
        per_page: 12,
        refresh,
      };

      if (selectedCategory) params.category = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;
      if (selectedTags.length > 0) params["tags[]"] = selectedTags;

      const res = await API.get("/admin/exercises", { params });

      const { regular, ondemand } = res.data;

      setRegularExercises(normalizeData(regular.data));
      setOndemandExercises(normalizeData(ondemand.data));

      setPaginationRegular({
        ...regular,
        last_page: regular.total_pages,
      });

      setPaginationOndemand({
        ...ondemand,
        last_page: ondemand.total_pages,
      });

      if (refresh) toast.success("Exercises refreshed successfully");
    } catch (err) {
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    fetchExercises(1, true);
  }, [selectedCategory, selectedLevel, selectedTags]);

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Exercise Management</h1>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => fetchExercises(1, true)}
            className="border-[#D32C86] text-[#D32C86]"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <AddExerciseDialog
            open={addExerciseOpen}
            onOpenChange={setAddExerciseOpen}
            onSuccess={() => fetchExercises()}
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-xl border bg-white p-5 space-y-2">
    <div>
      <h2 className="text-lg font-semibold">
        Filters
      </h2>

      <p className="text-sm text-muted-foreground">
        Filter exercises by category, level and tags
      </p>
      <div className="flex items-center justify-end">

          {(selectedCategory || selectedLevel || selectedTags.length > 0) && (
            <Button size="sm" variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
        

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* CATEGORY */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>

              <SelectContent>
                {ALL_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* LEVEL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Level</label>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>

              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TAGS */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>

            <Select onValueChange={(v) => toggleTag(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Add tags" />
              </SelectTrigger>

              <SelectContent>
                {ALL_TAGS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* SELECTED TAGS */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-2">
                {tag}
                <button onClick={() => toggleTag(tag)}>
                  <X className="h-3 w-3 hover:text-red-500" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {(["regular", "ondemand"] as const).map((tab) => (
          <Button
            key={tab}
            variant="outline"
            onClick={() => {
              setActiveTab(tab);
              setPlayingId(null);
            }}
            className={
              activeTab === tab
                ? "bg-[#D32C86] text-white"
                : ""
            }
          >
            {tab === "regular" ? "Exercises" : "On Demand"}
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

            {activeTab === "regular" &&
              regularExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  playingId={playingId}
                  onPlay={() => setPlayingId(ex.id)}
                  onView={() => {
                    setSelectedExercise(ex);
                    setDetailsOpen(true);
                  }}
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

            {activeTab === "ondemand" &&
              ondemandExercises.map((ex) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  playingId={playingId}
                  onPlay={() => setPlayingId(ex.id)}
                  onView={() => {
                    setSelectedExercise(ex);
                    setDetailsOpen(true);
                  }}
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
          </div>

          {/* PAGINATION */}
          {activeTab === "regular" &&
            paginationRegular.last_page > 1 && (
              <SmartPagination
                currentPage={paginationRegular.current_page}
                lastPage={paginationRegular.last_page}
                onPageChange={(p) => fetchExercises(p, false)}
              />
            )}

          {activeTab === "ondemand" &&
            paginationOndemand.last_page > 1 && (
              <SmartPagination
                currentPage={paginationOndemand.current_page}
                lastPage={paginationOndemand.last_page}
                onPageChange={(p) => fetchExercises(p, false)}
              />
            )}
        </>
      )}

      {/* MODALS */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selectedExercise?.title}</DialogTitle>
          </DialogHeader>

          {selectedExercise && (
            <div className="space-y-4">
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe
                  src={`${selectedExercise.video_url}?autoplay=0`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EditExerciseDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        exercise={editingExercise}
        onSuccess={() => fetchExercises()}
      />

      <DeleteExerciseDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (!deletingId) return;

          await API.delete(`/admin/exercises/${deletingId}`);
          toast.success("Deleted");
          setDeleteOpen(false);
          fetchExercises();
        }}
      />
    </div>
  );
}