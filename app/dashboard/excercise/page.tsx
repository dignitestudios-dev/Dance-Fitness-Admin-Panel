"use client";

import { useEffect, useState } from "react";
import { API } from "@/lib/api/axios";
import { Loader2, Plus, Play, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Exercise {
  id: number;
  title: string;
  categories: string[];
  level: string;
  tags: string | null;
  url: string;
  thumbnail: string | null;
  type: "ondemand" | "regular";
}

interface PaginatedExercises {
  current_page: number;
  data: Exercise[];
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export default function ExercisesPage() {
  const [regularExercises, setRegularExercises] = useState<Exercise[]>([]);
  const [ondemandExercises, setOndemandExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoDuration, setVideoDuration] = useState("");
  const [type, setType] = useState<"on_demand" | "regular" | "">("");

  const [filter, setFilter] = useState<"all" | "ondemand" | "regular">("all");  // New filter state

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs === 0) {
      return [mins, secs]
        .map((v) => v.toString().padStart(2, "0"))
        .join(":");
    }

    return [hrs, mins, secs].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  const fetchExercises = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/admin/exercises", { params: { page } });

      // Handle regular exercises
      setRegularExercises(res.data.regular.data);
      setPaginationRegular({
        current_page: res.data.regular.current_page,
        data: res.data.regular.data,
        last_page: res.data.regular.last_page,
        next_page_url: res.data.regular.next_page_url,
        prev_page_url: res.data.regular.prev_page_url,
      });

      // Handle ondemand exercises
      setOndemandExercises(res.data.ondemand.data);
      setPaginationOndemand({
        current_page: res.data.ondemand.current_page,
        data: res.data.ondemand.data,
        last_page: res.data.ondemand.last_page,
        next_page_url: res.data.ondemand.next_page_url,
        prev_page_url: res.data.ondemand.prev_page_url,
      });

    } catch (err) {
      console.error("Error fetching exercises:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);

    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const durationInSeconds = video.duration;
      const formattedDuration = formatDuration(durationInSeconds);
      setVideoDuration(formattedDuration);
    };

    video.src = URL.createObjectURL(file);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setThumbnailFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      alert("Video is required!");
      return;
    }

    if (!type) {
      alert("Please select exercise type");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      categories.forEach((c) => formData.append("categories[]", c));
      formData.append("level", level);
      formData.append("description", description);
      formData.append("tags", tags);
      equipment.forEach((eq) => formData.append("equipment[]", eq));
      formData.append("video", videoFile);
      formData.append("video_duration", videoDuration);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      formData.append("type", type);

      await API.post("/admin/add-exercise", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOpen(false);

      // Reset form
      setTitle("");
      setCategories([]);
      setLevel("");
      setDescription("");
      setTags("");
      setEquipment([]);
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoDuration("");
      setType("");

      fetchExercises(paginationRegular.current_page);
    } catch (err) {
      console.error(err);
      alert("Failed to add exercise");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExercise = async () => {
    if (!deletingId) return;

    setDeleting(true);
    try {
      await API.delete(`/admin/exercises/${deletingId}`);
      setRegularExercises((prev) => prev.filter((ex) => ex.id !== deletingId));
      setOndemandExercises((prev) => prev.filter((ex) => ex.id !== deletingId));
      setDeleteOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete exercise");
    } finally {
      setDeleting(false);
    }
  };

  const exercisesToShow = () => {
    switch (filter) {
      case "ondemand":
        return ondemandExercises;
      case "regular":
        return regularExercises;
      case "all":
      default:
        return [...regularExercises, ...ondemandExercises];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exercises</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Add New Exercise</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-3 mt-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <Input
                placeholder="Categories (comma separated)"
                value={categories.join(", ")}
                onChange={(e) =>
                  setCategories(
                    e.target.value.split(",").map((c) => c.trim())
                  )
                }
                required
              />
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Level" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Exercise Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ondemand">On Demand</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                placeholder="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <Input
                placeholder="Equipment"
                value={equipment.join(", ")}
                onChange={(e) =>
                  setEquipment(
                    e.target.value.split(",").map((eq) => eq.trim())
                  )
                }
              />

              <h1>Video</h1>
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                required
              />
              {videoDuration && (
                <Input
                  value={videoDuration}
                  disabled
                  placeholder="Video duration will be detected automatically"
                />
              )}

              <h1>Thumbnail</h1>
              <Input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Exercise"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Controls */}
      {/* Filter Controls */}
<div className="flex gap-4 mb-6">
  <Button
    variant="outline"
    onClick={() => setFilter("all")}
    className={filter === "all" ? "bg-[#D32C86] text-white" : "bg-transparent text-black"}
  >
    All Exercises
  </Button>
  <Button
    variant="outline"
    onClick={() => setFilter("regular")}
    className={filter === "regular" ? "bg-[#D32C86] text-white" : "bg-transparent text-black"}
  >
    Regular Exercises
  </Button>
  <Button
    variant="outline"
    onClick={() => setFilter("ondemand")}
    className={filter === "ondemand" ? "bg-[#D32C86] text-white" : "bg-transparent text-black"}
  >
    On Demand Exercises
  </Button>
</div>


      {/* Exercises Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {exercisesToShow().map((ex) => (
          <Card key={ex.id} className="overflow-hidden">
            <div className="relative">
              {playingId === ex.id ? (
                <video controls className="w-full h-40 object-cover">
                  <source
                    src={`https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${ex.url}`}
                    type="video/mp4"
                  />
                </video>
              ) : (
                <img
                  src={
                    ex.thumbnail
                      ? `https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${ex.thumbnail}`
                      : "https://placehold.co/400x200?text=No+Thumbnail"
                  }
                  alt={ex.title}
                  className="w-full h-40 object-contain cursor-pointer bg-muted"
                  onClick={() => setPlayingId(ex.id)}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://placehold.co/400x200?text=No+Thumbnail";
                  }}
                />
              )}

              {playingId !== ex.id && (
                <button
                  onClick={() => setPlayingId(ex.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                >
                  <Play className="h-5 w-5 text-green-500" />
                </button>
              )}
            </div>

            <CardContent className="space-y-2">
              <h2 className="font-semibold text-sm">{ex.title}</h2>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(ex.categories)
                  ? ex.categories
                  : [ex.categories]
                ).map((cat, idx) => (
                  <Badge key={idx}>#{cat}</Badge>
                ))}
                <Badge variant="secondary">{ex.level}</Badge>
                {/* <Badge variant="outline">{ex.type}</Badge>  */}
              </div>

              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setDeletingId(ex.id);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regular Pagination */}
      {paginationRegular.last_page > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!paginationRegular.prev_page_url}
            onClick={() => fetchExercises(paginationRegular.current_page - 1)}
          >
            &laquo; Previous
          </Button>

          {Array.from({ length: paginationRegular.last_page }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                size="sm"
                variant={page === paginationRegular.current_page ? "default" : "outline"}
                onClick={() => fetchExercises(page)}
              >
                {page}
              </Button>
            )
          )}

          <Button
            size="sm"
            variant="outline"
            disabled={!paginationRegular.next_page_url}
            onClick={() => fetchExercises(paginationRegular.current_page + 1)}
          >
            Next &raquo;
          </Button>
        </div>
      )}

      {/* Ondemand Pagination */}
      {paginationOndemand.last_page > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!paginationOndemand.prev_page_url}
            onClick={() => fetchExercises(paginationOndemand.current_page - 1)}
          >
            &laquo; Previous
          </Button>

          {Array.from({ length: paginationOndemand.last_page }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                size="sm"
                variant={page === paginationOndemand.current_page ? "default" : "outline"}
                onClick={() => fetchExercises(page)}
              >
                {page}
              </Button>
            )
          )}

          <Button
            size="sm"
            variant="outline"
            disabled={!paginationOndemand.next_page_url}
            onClick={() => fetchExercises(paginationOndemand.current_page + 1)}
          >
            Next &raquo;
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Exercise</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this exercise? This action cannot
            be undone.
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteExercise}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
