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
import { toast } from "sonner";

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

interface TrainingPlanExercise {
  id: number;
  title: string;
  categories: string[];
  duration: string;
  level: string;
  thumbnail: string | null;
  url?: string | null;
}

interface TrainingPlan {
  id: number;
  title: string;
  categories: string[];
  level: string;
  description: string;
  cover_image: string | null;
  exercises: TrainingPlanExercise[];
}

interface TrainingPlanPagination {
  current_page: number;
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
const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
const [trainingPlansPagination, setTrainingPlansPagination] =
  useState<TrainingPlanPagination | null>(null);
const [trainingPlansLoading, setTrainingPlansLoading] = useState(false);
  const [type, setType] = useState<"on_demand" | "regular" | "">("");

type Tab = "regular" | "ondemand" | "training-plans";
  const [activeTab, setActiveTab] = useState<Tab>("regular");

// Training Plan Form State
const [planTitle, setPlanTitle] = useState("");
const [planDescription, setPlanDescription] = useState("");
const [planCategories, setPlanCategories] = useState<string[]>([]);
const [planLevel, setPlanLevel] = useState("");
const [planSubmitting, setPlanSubmitting] = useState(false);
const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null); // track plan for modal








  // State for adding exercise to a training plan
const [addExerciseDialogOpen, setAddExerciseDialogOpen] = useState(false);
const [planForExercise, setPlanForExercise] = useState<TrainingPlan | null>(null);
const [exerciseTitle, setExerciseTitle] = useState("");
const [exerciseCategories, setExerciseCategories] = useState<string[]>([]);
const [exerciseLevel, setExerciseLevel] = useState("");
const [exerciseDescription, setExerciseDescription] = useState("");
const [exerciseTags, setExerciseTags] = useState("");
const [exerciseEquipment, setExerciseEquipment] = useState<string[]>([]);
const [exerciseType, setExerciseType] = useState<"on_demand" | "regular" | "">("");
const [exerciseVideoFile, setExerciseVideoFile] = useState<File | null>(null);
const [exerciseThumbnailFile, setExerciseThumbnailFile] = useState<File | null>(null);
const [exerciseVideoDuration, setExerciseVideoDuration] = useState("");
const [exerciseSubmitting, setExerciseSubmitting] = useState(false);



const handleExerciseVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setExerciseVideoFile(file);

  const video = document.createElement("video");
  video.preload = "metadata";
  video.onloadedmetadata = () => {
    URL.revokeObjectURL(video.src);
    setExerciseVideoDuration(formatDuration(video.duration));
  };
  video.src = URL.createObjectURL(file);
};

const handleExerciseThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files?.[0]) setExerciseThumbnailFile(e.target.files[0]);
};


const handleAddExerciseToPlan = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!planForExercise) return alert("No training plan selected!");
  if (!exerciseVideoFile) return alert("Video is required!");
  // if (!exerciseType) return alert("Select exercise type!");

  setExerciseSubmitting(true);

  try {
    const formData = new FormData();
    formData.append("training_plan_id", planForExercise.id.toString());
    formData.append("title", exerciseTitle);
    exerciseCategories.forEach((c) => formData.append("categories[]", c));
    formData.append("level", exerciseLevel);
    formData.append("description", exerciseDescription);
    formData.append("tags", exerciseTags);
    exerciseEquipment.forEach((eq) => formData.append("equipment[]", eq));
    formData.append("video", exerciseVideoFile);
    formData.append("video_duration", exerciseVideoDuration);
    if (exerciseThumbnailFile) formData.append("thumbnail", exerciseThumbnailFile);
    formData.append("type", exerciseType);

    await API.post("/admin/training-plans/add-exercise", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Exercise added to training plan!");
    window.location.reload(); // Reload to reflect changes in the plan details modal
    setAddExerciseDialogOpen(false);
    // reset form
    setExerciseTitle("");
    setExerciseCategories([]);
    setExerciseLevel("");
    setExerciseDescription("");
    setExerciseTags("");
    setExerciseEquipment([]);
    setExerciseVideoFile(null);
    setExerciseThumbnailFile(null);
    setExerciseVideoDuration("");
    setExerciseType("");
    fetchTrainingPlans(trainingPlansPagination?.current_page || 1);
  } catch (err) {
    console.error(err);
    alert("Failed to add exercise to plan");
  } finally {
    setExerciseSubmitting(false);
  }
};



const handleTrainingPlanSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!planTitle || !planLevel || planCategories.length === 0) {
    alert("Please fill all required fields!");
    return;
  }

  setPlanSubmitting(true);
  try {
    const payload = {
      title: planTitle,
      description: planDescription,
      categories: planCategories,
      level: planLevel,
    };

    await API.post("/admin/training-plans/create", payload);

    // Reset form
    setPlanTitle("");
    setPlanDescription("");
    setPlanCategories([]);
    setPlanLevel("");
    setPlanDialogOpen(false);

    // Refresh training plans list
    fetchTrainingPlans(trainingPlansPagination?.current_page || 1);
  } catch (err) {
    console.error("Failed to create training plan:", err);
    alert("Failed to create training plan");
  } finally {
    setPlanSubmitting(false);
  }
};




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

  const fetchTrainingPlans = async (page: number = 1) => {
  setTrainingPlansLoading(true);
  try {
    const res = await API.get("/admin/training-plans", { params: { page } });

    setTrainingPlans(res.data.data);
    setTrainingPlansPagination({
      current_page: res.data.current_page,
      last_page: res.data.last_page,
      next_page_url: res.data.next_page_url,
      prev_page_url: res.data.prev_page_url,
    });
  } catch (err) {
    console.error("Error fetching training plans", err);
  } finally {
    setTrainingPlansLoading(false);
  }
};

useEffect(() => {
  if (activeTab === "training-plans" && trainingPlans.length === 0) {
    fetchTrainingPlans();
  }
}, [activeTab]);


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
<div>
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

              <Select value={type} onValueChange={(value: string) => setType(value as "on_demand" | "regular" | "")}>
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
        <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
  <DialogTrigger asChild>
    <Button variant="outline" className="ml-2">
      <Plus className="mr-2 h-4 w-4" /> Add Training Plan
    </Button>
  </DialogTrigger>

  <DialogContent className="sm:max-w-md w-full">
    <DialogHeader>
      <DialogTitle>Create Training Plan</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleTrainingPlanSubmit} className="space-y-3 mt-2">
      <Input
        placeholder="Title"
        value={planTitle}
        onChange={(e) => setPlanTitle(e.target.value)}
        required
      />
      <Input
        placeholder="Categories (comma separated)"
        value={planCategories.join(", ")}
        onChange={(e) =>
          setPlanCategories(e.target.value.split(",").map((c) => c.trim()))
        }
        required
      />
      <Select value={planLevel} onValueChange={setPlanLevel}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Level" />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Description"
        value={planDescription}
        onChange={(e) => setPlanDescription(e.target.value)}
      />

      <Button type="submit" className="w-full" disabled={planSubmitting}>
        {planSubmitting ? "Creating..." : "Create Plan"}
      </Button>
    </form>
  </DialogContent>
</Dialog>

      </div>
      </div>

      {/* Filter Controls */}
      {/* Filter Controls */}
<div className="flex gap-4 mb-6">
  <Button
    variant="outline"
    onClick={() => setActiveTab("regular")}
    className={
      activeTab === "regular"
        ? "bg-[#D32C86] text-white"
        : "bg-transparent text-black"
    }
  >
    Exercises
  </Button>

  <Button
    variant="outline"
    onClick={() => setActiveTab("ondemand")}
    className={
      activeTab === "ondemand"
        ? "bg-[#D32C86] text-white"
        : "bg-transparent text-black"
    }
  >
    On Demand Exercises
  </Button>

  <Button
    variant="outline"
    onClick={() => setActiveTab("training-plans")}
    className={
      activeTab === "training-plans"
        ? "bg-[#D32C86] text-white"
        : "bg-transparent text-black"
    }
  >
    Training Plans
  </Button>
</div>


      {/* Exercises Grid */}
     {/* Exercises Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* REGULAR & ON-DEMAND EXERCISES */}
  {activeTab !== "training-plans" &&
    (activeTab === "regular" ? regularExercises : ondemandExercises).map(
      (ex) => (
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
      )
    )}

 {activeTab === "training-plans" &&
       trainingPlans.map((plan) => (
  <Card
    key={plan.id}
    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
    onClick={() => setSelectedPlan(plan)}
  >
    

    <CardHeader className="pb-1">
      <CardTitle className="text-lg font-semibold">{plan.title}</CardTitle>
    </CardHeader>

    <CardContent className="space-y-3 pt-2">
      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {plan.categories.map((cat, idx) => (
          <Badge key={idx} variant="outline" className="text-xs px-2 py-1">
            #{cat}
          </Badge>
        ))}
      </div>

      {/* Exercises count */}
      <div className="text-sm font-medium text-gray-700">
        Exercises: {plan.exercises.length}
      </div>

      {/* Exercises list */}
      {plan.exercises.length > 0 && (
        <div className="max-h-32 overflow-y-auto border-t pt-2 mt-1 border-gray-200">
          <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
            {plan.exercises.map((ex) => (
              <li key={ex.id}>{ex.title}</li>
            ))}
          </ul>
        </div>
      )}
    </CardContent>
  </Card>
        ))}

     {/* MODAL */}
{selectedPlan && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full relative overflow-hidden">
      
      {/* Close Button */}
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl font-bold"
        onClick={() => setSelectedPlan(null)}
      >
        &times;
      </button>

      {/* Modal Header */}
      <div className="px-6 pt-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPlan.title}</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedPlan.categories.map((cat, idx) => (
            <Badge key={idx}>#{cat}</Badge>
          ))}
          <Badge variant="secondary">{selectedPlan.level}</Badge>
        </div>
        <p className="text-sm text-gray-600">{selectedPlan.description}</p>
      </div>

      {/* Modal Body */}
      <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-4">
        
        {/* Add Exercise Button */}
        <div className="flex justify-between" >
          <h1 className="text-xl font-semibold">Exercise List</h1>
        <Button
          variant="outline"
          className="flex items-center justify-center w-full sm:w-auto mb-2"
          onClick={() => {
            setPlanForExercise(selectedPlan);
            setAddExerciseDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Exercise
        </Button>
</div>
        {/* Exercise List */}
      {/* Exercise List: Videos side by side */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {selectedPlan.exercises.map((ex) => (
    <div
      key={ex.id}
      className="flex flex-col items-start border rounded-lg p-3 hover:shadow-md transition-shadow"
    >
      {/* Video or Thumbnail */}
      {ex.url ? (
        <video
          controls
          className="w-full h-40 object-cover rounded-lg mb-2"
        >
          <source
            src={`https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${ex.url}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={
            ex.thumbnail
              ? `https://dancer-fitness-bucket.s3.us-east-2.amazonaws.com/${ex.thumbnail}`
              : "https://placehold.co/160x160"
          }
          className="w-full h-40 object-cover rounded-lg mb-2"
        />
      )}

      {/* Exercise Info */}
      <div>
        <p className="text-sm font-semibold text-gray-900">{ex.title}</p>
        <p className="text-xs text-gray-500">{ex.duration} • {ex.level}</p>
      </div>
    </div>
  ))}
</div>

      </div>
    </div>
  </div>
)}


      <Dialog open={addExerciseDialogOpen} onOpenChange={setAddExerciseDialogOpen}>
  <DialogContent className="sm:max-w-md w-full">
    <DialogHeader>
      <DialogTitle>Add Exercise to {planForExercise?.title}</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleAddExerciseToPlan} className="space-y-3 mt-2">
      <Input
        placeholder="Title"
        value={exerciseTitle}
        onChange={(e) => setExerciseTitle(e.target.value)}
        required
      />
      <Input
        placeholder="Categories (comma separated)"
        value={exerciseCategories.join(", ")}
        onChange={(e) =>
          setExerciseCategories(e.target.value.split(",").map((c) => c.trim()))
        }
        required
      />
      <Select value={exerciseLevel} onValueChange={setExerciseLevel}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Level" />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>
      {/* <Select value={exerciseType} onValueChange={(v: string) => setExerciseType(v as "on_demand" | "regular" | "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Exercise Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ondemand">On Demand</SelectItem>
          <SelectItem value="regular">Regular</SelectItem>
        </SelectContent>
      </Select> */}

      <Textarea
        placeholder="Description"
        value={exerciseDescription}
        onChange={(e) => setExerciseDescription(e.target.value)}
      />
      <Input
        placeholder="Tags"
        value={exerciseTags}
        onChange={(e) => setExerciseTags(e.target.value)}
      />
      <Input
        placeholder="Equipment (comma separated)"
        value={exerciseEquipment.join(", ")}
        onChange={(e) =>
          setExerciseEquipment(e.target.value.split(",").map((eq) => eq.trim()))
        }
      />

      <h1>Video</h1>
      <Input type="file" accept="video/*" onChange={handleExerciseVideoChange} required />
      {exerciseVideoDuration && (
        <Input
          value={exerciseVideoDuration}
          disabled
          placeholder="Video duration auto-detected"
        />
      )}

      <h1>Thumbnail</h1>
      <Input type="file" accept="image/*" onChange={handleExerciseThumbnailChange} />

      <Button type="submit" className="w-full" disabled={exerciseSubmitting}>
        {exerciseSubmitting ? "Adding..." : "Add Exercise"}
      </Button>
    </form>
  </DialogContent>
</Dialog>


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
