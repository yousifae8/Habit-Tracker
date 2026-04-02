import { supabase } from "../supabase";

export interface CheckIn {
  id: string;
  habit_id: string;
  user_id: string;
  checkin_date: string;
  status: boolean;
}

type CreateCheckInInput = {
  habitId: string;
  date?: string;
  status: boolean;
};

type ToggleCheckInInput = {
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

const createCheckIn = async ({ habitId, date, status }: CreateCheckInInput) => {
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

export interface HabitStats {
  id: string;
  current_streak: number;
  total_completions: number;
}

export const getHabitStats = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  const { data, error } = await supabase
    .from("checkins")
    .select("habit_id, checkin_date, status")
    .eq("user_id", user.id)
    .eq("status", true)
    .order("checkin_date", { ascending: false });

  if (error) throw error;

  const checkIns = data ?? [];
  const statsMap: Record<
    string,
    { total: number; streak: number; lastDate: string; seenDates: Set<string> }
  > = {};

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  checkIns.forEach((ci) => {
    if (!statsMap[ci.habit_id]) {
      statsMap[ci.habit_id] = {
        total: 0,
        streak: 0,
        lastDate: "",
        seenDates: new Set(),
      };
    }

    const s = statsMap[ci.habit_id];
    if (s.seenDates.has(ci.checkin_date)) return;
    s.total++;
    s.seenDates.add(ci.checkin_date);

    // Streak calculation
    if (s.streak === 0) {
      if (ci.checkin_date === today || ci.checkin_date === yesterday) {
        s.streak = 1;
        s.lastDate = ci.checkin_date;
      }
    } else if (s.streak > 0 && s.lastDate !== "BROKEN") {
      const prevDateObj = new Date(s.lastDate);
      const currDateObj = new Date(ci.checkin_date);
      const diffDays = Math.round(
        (prevDateObj.getTime() - currDateObj.getTime()) / 86400000,
      );

      if (diffDays === 1) {
        s.streak++;
        s.lastDate = ci.checkin_date;
      } else if (diffDays > 1) {
        s.lastDate = "BROKEN";
      }
    }
  });

  return Object.keys(statsMap).map((id) => ({
    id,
    current_streak: statsMap[id].streak,
    total_completions: statsMap[id].total,
  }));
};

export const getSummaryStats = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("User not found");

  // Fetch all successful check-ins to calculate total and streaks
  const { data, error } = await supabase
    .from("checkins")
    .select("checkin_date, status")
    .eq("user_id", user.id)
    .eq("status", true)
    .order("checkin_date", { ascending: false });

  if (error) throw error;

  const checkIns = data ?? [];
  const totalCompletions = checkIns.length;

  // Quick streak calculation (current streak)
  let currentStreak = 0;
  if (checkIns.length > 0) {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    let lastDate = checkIns[0].checkin_date;

    // Check if user has checked in today or yesterday to maintain the streak
    if (lastDate === today || lastDate === yesterday) {
      currentStreak = 1;
      const seenDates = new Set([lastDate]);

      for (let i = 1; i < checkIns.length; i++) {
        const currentDate = checkIns[i].checkin_date;
        if (seenDates.has(currentDate)) continue;

        const prevDateObj = new Date(lastDate);
        const currDateObj = new Date(currentDate);
        const diffDays = Math.round(
          (prevDateObj.getTime() - currDateObj.getTime()) / 86400000,
        );

        if (diffDays === 1) {
          currentStreak++;
          lastDate = currentDate;
          seenDates.add(currentDate);
        } else {
          break;
        }
      }
    }
  }

  return {
    totalCompletions,
    currentStreak,
  };
};
