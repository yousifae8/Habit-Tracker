import { supabase } from "../supabase";

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: string;
  user_id: string;
}

type CreateHabitInput = Pick<Habit, "name" | "description" | "frequency">;

type UpdateHabitInput = {
    id: Habit["id"];
    updates: Partial<Pick<Habit, "name" | "description" | "frequency">>;
}

type DeleteHabitInput = {
    id: Habit["id"];
}

export const createHabit = async (habit: CreateHabitInput) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User not found");

  const { data: insertData, error: insertError } = await supabase
    .from("habits")
    .insert([{name: habit.name, description: habit.description, frequency: habit.frequency, user_id: user.id}]);
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
    .eq("user_id", user.id);
  if (getHabitsError) {
    throw getHabitsError;
  }
  return getHabitsData;
};

export const updateHabit = async ({id, updates}: UpdateHabitInput) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User not found");

  const { data: updateHabitsData, error: updateHabitsError } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);
  if (updateHabitsError) {
    throw updateHabitsError;
  }
  return updateHabitsData;
};

export const deleteHabit = async ({ id }: DeleteHabitInput) => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("User not found");

  const { data: deleteHabitsData, error: deleteHabitsError } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (deleteHabitsError) {
    throw deleteHabitsError;
  }
  return deleteHabitsData;
};
