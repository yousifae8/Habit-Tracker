"use client";

import {
  Box,
  Card,
  Checkbox,
  Chip,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArchiveIcon from "@mui/icons-material/Archive";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { Habit } from "../services/habits";

type HabitCardProps = {
  habit: Habit;
  isDone: boolean;
  onToggle: (nextStatus: boolean) => void;
  onEdit: () => void;
  onArchive: () => void;
  isToggling: boolean;
  isArchiving: boolean;
  streak?: number;
  totalCompletions?: number;
};

export default function HabitCard({
  habit,
  isDone,
  onToggle,
  onEdit,
  onArchive,
  isToggling,
  isArchiving,
  streak = 0,
  totalCompletions = 0,
}: HabitCardProps) {
  return (
    <Card
      sx={{
        mb: 2,
        p: 2,
        display: "flex",
        alignItems: "center",
        borderRadius: (theme) => `${theme.shape.borderRadius}px`,
        transition: "all 0.2s ease-in-out",
        border: (theme) =>
          `1px solid ${isDone ? theme.palette.success.light : theme.palette.divider}`,
        boxShadow: (theme) => (isDone ? theme.shadows[2] : theme.shadows[1]),
        backgroundColor: isDone ? "rgba(76, 175, 80, 0.02)" : "background.paper",
        "&:hover": {
          boxShadow: (theme) => theme.shadows[3],
          transform: "translateY(-2px)",
        },
      }}
    >
      <Checkbox
        checked={isDone}
        onChange={(e) => onToggle(e.target.checked)}
        disabled={isToggling}
        sx={{
          mr: 2,
          color: "rgba(0,0,0,0.2)",
          "&.Mui-checked": {
            color: "success.main",
          },
        }}
      />
      
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            textDecoration: isDone ? "line-through" : "none",
            color: isDone ? "text.secondary" : "text.primary",
            fontSize: "1.1rem",
            mb: 0.5,
          }}
        >
          {habit.name}
        </Typography>
        
        {habit.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, opacity: isDone ? 0.6 : 1 }}
          >
            {habit.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          {/* Example static badges for now - ideally these come from the stats */}
          <Chip
            size="small"
            icon={<LocalFireDepartmentIcon sx={{ fontSize: "14px !important" }} />}
            label={`${streak} day streak`}
            variant="outlined"
            sx={{
              fontSize: "11px",
              height: "24px",
              color: streak > 0 ? "error.main" : "text.secondary",
              borderColor: streak > 0 ? "error.light" : "divider",
            }}
          />
          <Chip
            size="small"
            icon={<DoneAllIcon sx={{ fontSize: "14px !important" }} />}
            label={`${totalCompletions} total`}
            variant="outlined"
            sx={{ fontSize: "11px", height: "24px" }}
          />
          {habit.category && (
            <Chip
              size="small"
              label={habit.category}
              sx={{
                fontSize: "11px",
                height: "24px",
                backgroundColor: "rgba(0,0,0,0.05)",
                fontWeight: 500,
              }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={onEdit} sx={{ color: "text.secondary" }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Archive">
          <IconButton
            size="small"
            onClick={onArchive}
            disabled={isArchiving}
            sx={{ color: "text.secondary", "&:hover": { color: "warning.main" } }}
          >
            <ArchiveIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
}
