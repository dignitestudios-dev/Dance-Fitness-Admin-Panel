import { Play, Trash2, Edit, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Exercise } from "./types";
import { S3_BUCKET_URL } from "./constants";
import { getImageUrl, getVideoUrl } from "./utils";

interface ExerciseCardProps {
  exercise: Exercise;
  playingId: number | null;
  onPlay: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onView: () => void; // ✅ ADD THIS
}

export default function ExerciseCard({
  exercise,
  playingId,
  onPlay,
  onDelete,
  onEdit,
  onView, // ✅ DESTRUCTURE
}: ExerciseCardProps) {
  const isPlaying = playingId === exercise.id;

  return (
    <Card className="overflow-hidden">
      {/* Media */}
      {/* <div className="relative">
        {isPlaying ? (
          <video controls className="w-full h-40 object-cover">
            <source
              src={getVideoUrl(exercise.url, S3_BUCKET_URL)}
              type="video/mp4"
            />
          </video>
        ) : (
          <img
            src={getImageUrl(
              exercise.thumbnail,
              S3_BUCKET_URL,
              "https://placehold.co/400x200?text=No+Thumbnail"
            )}
            alt={exercise.title}
            className="w-full h-40 object-contain cursor-pointer bg-muted"
            onClick={onPlay}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://placehold.co/400x200?text=No+Thumbnail";
            }}
          />
        )}

        {!isPlaying && (
          <button
            onClick={onPlay}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
          >
            <Play className="h-5 w-5 text-green-500" />
          </button>
        )}
      </div> */}
      <div className="relative">
  <video
    controls
    className="w-full h-40 object-cover"
  >
    <source
      src={getVideoUrl(exercise.url, S3_BUCKET_URL)}
      type="video/mp4"
    />
    Your browser does not support the video tag.
  </video>
</div>


      {/* Content */}
      <CardContent className="space-y-2">
        <h2 className="font-semibold text-sm line-clamp-2">
          {exercise.title}
        </h2>

        {/* Categories & Level */}
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(exercise.categories)
            ? exercise.categories
            : [exercise.categories]
          ).map((cat, idx) => (
            <Badge key={idx}>#{cat}</Badge>
          ))}
          <Badge variant="secondary">{exercise.level}</Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onView} // ✅ FIXED
          >
            <Eye className="h-4 w-4 mr-1" />
            
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
