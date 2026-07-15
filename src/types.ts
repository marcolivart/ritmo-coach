export type Goal = "lose" | "maintain" | "gain";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";
export type FoodPreferenceType = "blocked" | "allergy" | "disliked" | "favorite";

export type Profile = {
  id: string;
  name: string;
  sex: "male" | "female" | "other";
  birth_date: string | null;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  goal: Goal;
  weighing_day: number;
  activity_level: ActivityLevel;
  exercise_types: string[];
  training_days: number;
  meal_count: number;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
};

export type FoodPreference = {
  id: number;
  user_id: string;
  food_name: string;
  restriction_type: FoodPreferenceType;
  created_at?: string;
};

export type WeightLog = {
  id: number;
  user_id: string;
  weight_kg: number;
  measured_at: string;
  created_at?: string;
};

export type DatabaseGroceryItem = {
  id: number;
  user_id: string;
  week_start: string;
  category: string;
  name: string;
  amount: string;
  checked: boolean;
  created_at?: string;
};
