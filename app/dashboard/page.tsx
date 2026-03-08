"use client";

import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import HabitForm from "../components/HabitForm";
import {
  archiveHabit,
  createHabit,
  getHabits,
  Habit,
  updateHabit,
} from "../services/habits";

const Dashboard = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHabits();
      setHabits(data ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load habits";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateOpen(true)}
        >
          Add Habit
        </Button>
      </Box>

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
