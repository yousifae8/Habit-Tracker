import { supabase } from "../supabase";

export interface CheckIn {
  id: string;
  habit_id: string;
  user_id: string;
  checkin_date: string;
  status: boolean;
}

export type CreateCheckInInput = {
  habitId: string;
  date?: string;
  status: boolean;
};

export type ToggleCheckInInput = {
  habitId: string;
  status: boolean;
  date?: string;
};

const formatDate = (value?: string) => {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  return value;
};

const assertDateIsEditable = (date: string) => {
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    throw new Error("Past dates are read-only");
  }
};

export const createCheckIn = async ({
  habitId,
  date,
  status,
}: CreateCheckInInput) => {
  const checkinDate = formatDate(date);
  assertDateIsEditable(checkinDate);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  const { data: existingCheckIn, error: existingCheckInError } = await supabase
    .from("checkins")
    .select("id")
    .eq("user_id", user.id)
    .eq("habit_id", habitId)
    .eq("checkin_date", checkinDate)
    .maybeSingle();

  if (existingCheckInError) throw existingCheckInError;
  if (existingCheckIn) {
    throw new Error("Only one check-in is allowed per habit per day");
  }

  const { data, error } = await supabase
    .from("checkins")
    .insert([
      {
        habit_id: habitId,
        user_id: user.id,
        checkin_date: checkinDate,
        status,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as CheckIn;
};

export const getCheckInsByDate = async (date?: string) => {
  const checkinDate = formatDate(date);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .eq("checkin_date", checkinDate);

  if (error) throw error;
  return (data ?? []) as CheckIn[];
};

export const toggleDailyCheckIn = async ({
  habitId,
  status,
  date,
}: ToggleCheckInInput) => {
  const checkinDate = formatDate(date);
  assertDateIsEditable(checkinDate);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  const { data: existingCheckIn, error: existingCheckInError } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .eq("habit_id", habitId)
    .eq("checkin_date", checkinDate)
    .maybeSingle();

  if (existingCheckInError) throw existingCheckInError;

  if (existingCheckIn) {
    const { data: updatedCheckIn, error: updateError } = await supabase
      .from("checkins")
      .update({ status })
      .eq("id", existingCheckIn.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedCheckIn as CheckIn;
  }

  return createCheckIn({ habitId, date: checkinDate, status });
};
