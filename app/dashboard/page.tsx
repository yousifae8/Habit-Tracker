"use client";

import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import HabitForm from "../components/HabitForm";
import {
  CheckIn,
  getCheckInsByDate,
  toggleDailyCheckIn,
} from "../services/checkins";
import {
  archiveHabit,
  createHabit,
  getHabits,
  Habit,
  updateHabit,
} from "../services/habits";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
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
      const [habitsData, checkInsData] = await Promise.all([
        getHabits(),
        getCheckInsByDate(todayDate),
      ]);
      setHabits(habitsData ?? []);
      setCheckInsByHabitId(mapCheckInsByHabitId(checkInsData));
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

  const handleCreateHabit = async (values: { name: string; description: string }) => {
    setActionError(null);
    const createdHabit = await createHabit({
      name: values.name,
      description: values.description,
      frequency: "daily",
    });
    setHabits((prev) => [createdHabit, ...prev]);
  };

  const handleUpdateHabit = async (values: { name: string; description: string }) => {
    setActionError(null);
    if (!editingHabit) {
      return;
    }
    await updateHabit({
      id: editingHabit.id,
      updates: {
        name: values.name,
        description: values.description,
      },
    });
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === editingHabit.id
          ? { ...habit, name: values.name, description: values.description }
          : habit,
      ),
    );
  };

  const handleArchiveHabit = async (habitId: string) => {
    setActionError(null);
    setArchivingId(habitId);
    try {
      await archiveHabit({ id: habitId });
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to archive habit";
      setActionError(message);
    } finally {
      setArchivingId(null);
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateOpen(true)}
          >
            Add Habit
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Today: {todayDateLabel}
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {error ? <Alert severity="error">{error}</Alert> : null}
      {actionError ? <Alert severity="error">{actionError}</Alert> : null}

      {!loading && !error ? (
        habits.length > 0 ? (
          <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
            {habits.map((habit) => (
              <ListItem key={habit.id} divider>
                <ListItemText
                  primary={habit.name}
                  secondary={habit.description || "No description"}
                />
                <FormControlLabel
                  sx={{ mr: 2 }}
                  control={
                    <Checkbox
                      checked={Boolean(checkInsByHabitId[habit.id]?.status)}
                      onChange={(event) =>
                        handleToggleCheckIn(habit.id, event.target.checked)
                      }
                      disabled={togglingCheckInId === habit.id}
                    />
                  }
                  label="Done today"
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setEditingHabit(habit)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  startIcon={<ArchiveIcon />}
                  onClick={() => handleArchiveHabit(habit.id)}
                  disabled={archivingId === habit.id}
                >
                  {archivingId === habit.id ? "Archiving..." : "Archive"}
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">
            No habits yet. Create your first habit.
          </Typography>
        )
      ) : null}

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
            }}
            submitLabel="Save Changes"
            onSubmit={handleUpdateHabit}
            onSuccess={() => setEditingHabit(null)}
            onCancel={() => setEditingHabit(null)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
