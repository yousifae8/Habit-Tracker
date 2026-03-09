"use client";

import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import HabitForm from "../components/HabitForm";
import StatsOverview from "../components/StatsOverview";
import HabitCard from "../components/HabitCard";
import {
  CheckIn,
  getCheckInsByDate,
  getSummaryStats,
  getHabitStats,
  HabitStats,
  toggleDailyCheckIn,
} from "../services/checkins";
import {
  archiveHabit,
  createHabit,
  getHabits,
  Habit,
  restoreHabit,
  updateHabit,
} from "../services/habits";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [activeHabits, setActiveHabits] = useState<Habit[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [view, setView] = useState<"active" | "archived">("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalCompletions: 0, currentStreak: 0 });
  const [habitStats, setHabitStats] = useState<Record<string, HabitStats>>({});
  const [checkInsByHabitId, setCheckInsByHabitId] = useState<
    Record<string, CheckIn>
  >({});
  const [togglingCheckInId, setTogglingCheckInId] = useState<string | null>(
    null,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayDateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mapCheckInsByHabitId = (checkIns: CheckIn[]) =>
    checkIns.reduce<Record<string, CheckIn>>((acc, checkIn) => {
      acc[checkIn.habit_id] = checkIn;
      return acc;
    }, {});

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeHabitsData, archivedHabitsData, checkInsData, statsData, hStatsData] =
        await Promise.all([
          getHabits(true),
          getHabits(false),
          getCheckInsByDate(todayDate),
          getSummaryStats(),
          getHabitStats(),
        ]);
      setActiveHabits(activeHabitsData ?? []);
      setArchivedHabits(archivedHabitsData ?? []);
      setCheckInsByHabitId(mapCheckInsByHabitId(checkInsData));
      setStats(statsData);
      setHabitStats(
        hStatsData.reduce((acc: Record<string, HabitStats>, s: HabitStats) => {
          acc[s.id] = s;
          return acc;
        }, {} as Record<string, HabitStats>),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load habits";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCreateHabit = async (values: {
    name: string;
    description: string;
    category: string;
  }) => {
    setActionError(null);
    const createdHabit = await createHabit({
      name: values.name,
      description: values.description,
      category: values.category,
      frequency: "daily",
    });
    setActiveHabits((prev) => [createdHabit, ...prev]);
  };

  const handleUpdateHabit = async (values: {
    name: string;
    description: string;
    category: string;
  }) => {
    setActionError(null);
    if (!editingHabit) {
      return;
    }
    await updateHabit({
      id: editingHabit.id,
      updates: {
        name: values.name,
        description: values.description,
        category: values.category,
      },
    });
    setActiveHabits((prev) =>
      prev.map((habit) =>
        habit.id === editingHabit.id
          ? {
              ...habit,
              name: values.name,
              description: values.description,
              category: values.category,
            }
          : habit,
      ),
    );
  };

  const handleArchiveHabit = async (habitId: string) => {
    setActionError(null);
    setArchivingId(habitId);
    try {
      await archiveHabit({ id: habitId });
      setActiveHabits((prev) => {
        const habitToArchive = prev.find((habit) => habit.id === habitId);
        if (habitToArchive) {
          setArchivedHabits((archived) => [
            { ...habitToArchive, is_active: false },
            ...archived,
          ]);
        }
        return prev.filter((habit) => habit.id !== habitId);
      });
      setCheckInsByHabitId((prev) => {
        const { [habitId]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to archive habit";
      setActionError(message);
    } finally {
      setArchivingId(null);
    }
  };

  const handleRestoreHabit = async (habitId: string) => {
    setActionError(null);
    setRestoringId(habitId);
    try {
      await restoreHabit({ id: habitId });
      setArchivedHabits((prev) => {
        const habitToRestore = prev.find((habit) => habit.id === habitId);
        if (habitToRestore) {
          setActiveHabits((active) => [
            { ...habitToRestore, is_active: true },
            ...active,
          ]);
        }
        return prev.filter((habit) => habit.id !== habitId);
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to restore habit";
      setActionError(message);
    } finally {
      setRestoringId(null);
    }
  };

  const handleToggleCheckIn = async (habitId: string, nextStatus: boolean) => {
    setActionError(null);
    setTogglingCheckInId(habitId);

    const previousCheckIn = checkInsByHabitId[habitId];
    const optimisticCheckIn: CheckIn = previousCheckIn
      ? { ...previousCheckIn, status: nextStatus }
      : {
          id: `temp-${habitId}`,
          habit_id: habitId,
          user_id: "",
          checkin_date: todayDate,
          status: nextStatus,
        };

    setCheckInsByHabitId((prev) => ({
      ...prev,
      [habitId]: optimisticCheckIn,
    }));

    try {
      const updatedCheckIn = await toggleDailyCheckIn({
        habitId,
        status: nextStatus,
        date: todayDate,
      });
      setCheckInsByHabitId((prev) => ({
        ...prev,
        [habitId]: updatedCheckIn,
      }));
      // Refresh stats
      const statsData = await getSummaryStats();
      setStats(statsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update check-in";
      setActionError(message);
      setCheckInsByHabitId((prev) => {
        if (!previousCheckIn) {
          const { [habitId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [habitId]: previousCheckIn };
      });
    } finally {
      setTogglingCheckInId(null);
    }
  };

  const handleLogout = async () => {
    setActionError(null);
    setIsLoggingOut(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to logout";
      setActionError(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.dark} 100%)`,
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                  letterSpacing: "-0.01rem",
                }}
              >
                Habit Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {todayDateLabel}
              </Typography>
            </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateOpen(true)}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              New Habit
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              disabled={isLoggingOut}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "rgba(0,0,0,0.12)",
              }}
            >
              {isLoggingOut ? "Logout..." : "Logout"}
            </Button>
          </Box>
        </Box>

        {!loading && !error && (
          <StatsOverview
            completedToday={
              Object.values(checkInsByHabitId).filter((c) => c.status).length
            }
            totalHabits={activeHabits.length}
            currentStreak={stats.currentStreak}
            totalCompletions={stats.totalCompletions}
          />
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={50} thickness={4.5} />
          </Box>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : null}
        {actionError ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {actionError}
          </Alert>
        ) : null}

        {!loading && !error ? (
          <Tabs
            value={view}
            onChange={(_, nextView) => setView(nextView)}
            sx={{ mb: 2 }}
          >
            <Tab label={`Active (${activeHabits.length})`} value="active" />
            <Tab label={`Archived (${archivedHabits.length})`} value="archived" />
          </Tabs>
        ) : null}

        {!loading && !error && view === "active" ? (
          activeHabits.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {activeHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isDone={Boolean(checkInsByHabitId[habit.id]?.status)}
                  onToggle={(nextStatus) =>
                    handleToggleCheckIn(habit.id, nextStatus)
                  }
                  onEdit={() => setEditingHabit(habit)}
                  onArchive={() => handleArchiveHabit(habit.id)}
                  isToggling={togglingCheckInId === habit.id}
                  isArchiving={archivingId === habit.id}
                  streak={habitStats[habit.id]?.current_streak}
                  totalCompletions={habitStats[habit.id]?.total_completions}
                />
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                backgroundColor: "rgba(255,255,255,0.6)",
                borderRadius: 4,
                border: "2px dashed rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your habits will appear here
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Consistency is key. Start by tracking your first daily goal.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setIsCreateOpen(true)}
                sx={{ borderRadius: 2, textTransform: "none" }}
              >
                Get Started
              </Button>
            </Box>
          )
        ) : null}

        {!loading && !error && view === "archived" ? (
          archivedHabits.length > 0 ? (
            <Box sx={{ mt: 2, display: "grid", gap: 1.5 }}>
              {archivedHabits.map((habit) => (
                <Box
                  key={habit.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {habit.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {habit.description || "No description"}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<RestoreFromTrashIcon />}
                    onClick={() => handleRestoreHabit(habit.id)}
                    disabled={restoringId === habit.id}
                  >
                    {restoringId === habit.id ? "Restoring..." : "Restore"}
                  </Button>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                backgroundColor: "rgba(255,255,255,0.6)",
                borderRadius: 4,
                border: "2px dashed rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No archived habits
              </Typography>
            </Box>
          )
        ) : null}
      </Container>
    </Box>

      <Dialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Habit</DialogTitle>
        <DialogContent>
          <HabitForm
            onSubmit={handleCreateHabit}
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingHabit)}
        onClose={() => setEditingHabit(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Habit</DialogTitle>
        <DialogContent>
          <HabitForm
            initialValues={{
              name: editingHabit?.name ?? "",
              description: editingHabit?.description ?? "",
              category: editingHabit?.category ?? "Health",
            }}
            submitLabel="Save Changes"
            onSubmit={handleUpdateHabit}
            onSuccess={() => setEditingHabit(null)}
            onCancel={() => setEditingHabit(null)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
