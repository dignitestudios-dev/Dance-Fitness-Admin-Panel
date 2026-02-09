import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrainingPlan } from "./types";
import { S3_BUCKET_URL } from "./constants";
import { getImageUrl } from "./utils";

interface TrainingPlanCardProps {
  plan: TrainingPlan;
  onClick: () => void;
}

export default function TrainingPlanCard({ plan, onClick }: TrainingPlanCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 relative"
      onClick={onClick}
    >
      {plan.cover_image && (
        <div className="relative w-full h-40 bg-gray-100">
          <img
            src={getImageUrl(plan.cover_image, S3_BUCKET_URL, "https://placehold.co/400x200?text=No+Cover")}
            alt={plan.title}
            className="w-full h-40 object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "https://placehold.co/400x200?text=No+Cover";
            }}
          />
        </div>
      )}

      <CardHeader className="pb-1 pl-6">
        <CardTitle className="text-lg font-semibold">{plan.title}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-sm font-medium text-gray-700">
          Exercises: {plan.exercises.length}
        </div>
      </CardContent>
    </Card>
  );
}
