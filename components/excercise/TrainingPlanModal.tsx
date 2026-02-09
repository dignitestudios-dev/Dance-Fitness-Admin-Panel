import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrainingPlan } from "./types";
import { S3_BUCKET_URL } from "./constants";
import { getImageUrl, getVideoUrl } from "./utils";

interface TrainingPlanModalProps {
  plan: TrainingPlan | null;
  onClose: () => void;
  onAddExercise: (plan: TrainingPlan) => void;
}

export default function TrainingPlanModal({ plan, onClose, onAddExercise }: TrainingPlanModalProps) {
  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full relative overflow-hidden">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            {plan.categories.map((cat, idx) => (
              <Badge key={idx}>#{cat}</Badge>
            ))}
            <Badge variant="secondary">{plan.level}</Badge>
          </div>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Add Exercise Button */}
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Exercise List</h1>
            <Button
              variant="outline"
              className="flex items-center justify-center w-full sm:w-auto mb-2"
              onClick={() => onAddExercise(plan)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Exercise
            </Button>
          </div>

          {/* Exercise List: Videos side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {plan.exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex flex-col items-start border rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                {/* Video or Thumbnail */}
                {ex.url ? (
                  <video controls className="w-full h-40 object-cover rounded-lg mb-2">
                    <source src={getVideoUrl(ex.url, S3_BUCKET_URL)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={getImageUrl(ex.thumbnail, S3_BUCKET_URL, "https://placehold.co/160x160")}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                    alt={ex.title}
                  />
                )}

                {/* Exercise Info */}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{ex.title}</p>
                  <p className="text-xs text-gray-500">
                    {ex.duration} • {ex.level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
