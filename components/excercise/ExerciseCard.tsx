  import { Play, Trash2, Edit, Eye } from "lucide-react";
  import { Card, CardContent } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { Exercise } from "./types";
  import { S3_BUCKET_URL } from "./constants";
  import { getImageUrl } from "./utils";

  interface ExerciseCardProps {
    exercise: Exercise;
    playingId: number | null;
    onPlay: () => void;
    onDelete: () => void;
    onEdit: () => void;
    onView: () => void;
  }

  export default function ExerciseCard({
    exercise,
    playingId,
    onPlay,
    onDelete,
    onEdit,
    onView,
  }: ExerciseCardProps) {
    const isPlaying = playingId === exercise.id;
const videoSrc = exercise?.video_url || exercise?.video;

// Use API thumbnail_url first
const imageSrc =
  exercise?.thumbnail_url ||
  getImageUrl(exercise?.thumbnail, S3_BUCKET_URL, "");

    return (
      <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Media Section */}
       {/* Media Section */}
<div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
  {isPlaying ? (
    <iframe
      src={`${videoSrc}?autoplay=1&title=0&byline=0&portrait=0`}
      className="w-full h-full"
      frameBorder="0"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <div
      className="relative h-full w-full group cursor-pointer"
      onClick={onPlay}
    >
      {/* Thumbnail */}
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={exercise.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-slate-800" />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-300" />

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Play className="h-8 w-8 text-white fill-white" />
        </div>
      </div>
    </div>
  )}
</div>

        {/* Content Section */}
        <CardContent className="p-4 bg-white">
          <h2 className="font-bold text-sm leading-tight line-clamp-2 h-10 mb-3 text-slate-800">
            {exercise.title}
          </h2>

          {/* Level Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-[#D32C86] hover:bg-[#D32C86] text-white border-none text-[10px]">
              {exercise.level}
            </Badge>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {Array.isArray(exercise.categories) ? exercise.categories[0] : ""}
            </span>
          </div>

          {/* Minimal Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button onClick={onView} className="text-slate-500 hover:text-[#D32C86] transition-colors">
              <Eye className="h-4 w-4" />
            </button>
            
            <div className="flex gap-3">
              <button onClick={onEdit} className="text-slate-500 hover:text-blue-600 transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="text-slate-400 hover:text-red-600 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }