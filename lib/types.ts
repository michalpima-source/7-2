export type UserRole = 'client' | 'trainer'
export type Goal = 'weight_loss' | 'muscle_gain' | 'general_fitness'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  phone: string | null
  created_at: string
}

export interface ClientProfile {
  id: string
  goal: Goal | null
  fitness_level: FitnessLevel | null
  available_days: string[]
  limitations: string | null
  onboarded_at: string | null
}

export interface Exercise {
  id: string
  workout_day_id: string
  name: string
  sets: number
  reps: string
  rest_seconds: number
  instructions: string | null
  exercise_order: number
}

export interface WorkoutDay {
  id: string
  plan_id: string
  day_name: string
  day_order: number
  exercises: Exercise[]
}

export interface WorkoutPlan {
  id: string
  client_id: string
  name: string
  is_active: boolean
  ai_generated: boolean
  created_at: string
  workout_days: WorkoutDay[]
}

export interface WorkoutLog {
  id: string
  client_id: string
  workout_day_id: string
  completed_at: string
  feedback: string | null
}

export interface ChatMessage {
  id: string
  client_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ClientWithStats extends Profile {
  client_profile: ClientProfile | null
  completion_pct: number
  active_plan_name: string | null
}

export const GOAL_LABELS: Record<Goal, string> = {
  weight_loss: 'ירידה במשקל',
  muscle_gain: 'עלייה במסת שריר',
  general_fitness: 'כושר כללי',
}

export const LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: 'מתחיל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
}

export const DAYS_OF_WEEK = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת',
]
