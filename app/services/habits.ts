import { supabase } from "../supabase";

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: string;
  category?: string;
  user_id: string;
  is_active: boolean;
}

type CreateHabitInput = Pick<
  Habit,
  "name" | "description" | "frequency" | "category"
>;

export type UpdateHabitInput = {
  id: Habit["id"];
  updates: Partial<Pick<Habit, "name" | "description" | "frequency" | "category">>;
};

type DeleteHabitInput = {
  id: Habit["id"];
};

export const createHabit = async (habit: CreateHabitInput) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User not found");

  const { data: insertData, error: insertError } = await supabase
    .from("habits")
    .insert([
      {
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        category: habit.category,
        user_id: user.id,
        is_active: true,
      },
    ])
    .select()
    .single();
  if (insertError) throw insertError;
  return insertData;
};

export const getHabits = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User not found");

  const { data: getHabitsData, error: getHabitsError } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true);
  if (getHabitsError) {
    throw getHabitsError;
  }
  return getHabitsData;
};

export const updateHabit = async ({ id, updates }: UpdateHabitInput) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User not found");

  const { error: updateHabitsError } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);
  if (updateHabitsError) {
    throw updateHabitsError;
  }
};

export const archiveHabit = async ({ id }: DeleteHabitInput) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User not found");

  const { error: archivedHabitError } = await supabase
    .from("habits")
    .update({ is_active: false })
    .eq("id", id)
    .eq("user_id", user.id);
  if (archivedHabitError) {
    throw archivedHabitError;
  }
};
