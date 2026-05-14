export interface Exercise {
  id: number;
  title: string;
  categories: string[];
  level: string;
  tags: string | null;
  url: string;
  video_url: string | null;
  video?: string | null;
  thumbnail: string | null;
  thumbnail_url?: string | null;
  type: "ondemand" | "regular";
  description?: string;
  equipment?: string[];
  show_on_home_page?: boolean;
  show_on_watch_on_demand?: boolean;
}

export interface PaginatedExercises {
  current_page: number;
  data: Exercise[];
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface TrainingPlanExercise {
  id: number;
  title: string;
  categories: string[];
  duration: string;
  level: string;
  thumbnail: string | null;
  url?: string | null;
}

export interface TrainingPlan {
  id: number;
  title: string;
  categories: string[];
  level: string;
  description: string;
  cover_image: string | null;
  exercises: TrainingPlanExercise[];
    image?: string;
  exercise_count: number;
 is_saved?: boolean;
  created_at?: string;
    tags?: string[];

}

export interface TrainingPlanPagination {
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}
