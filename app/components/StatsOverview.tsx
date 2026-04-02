"use client";

import { Box, Card, Grid, LinearProgress, Typography } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type StatsOverviewProps = {
  completedToday: number;
  totalHabits: number;
  currentStreak: number;
  totalCompletions: number;
};

const StatCard = ({ title, value, subValue, icon, color, progress }: any) => (
  <Card
    sx={{
      p: 3,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      borderRadius: "inherit", // Inherits from paper/card overrides if set, or just use number
      boxShadow: (theme) => theme.shadows[1],
      backgroundColor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          p: 1,
          borderRadius: 2,
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="bold">
        {value}
      </Typography>
    </Box>
    <Box>
      <Typography variant="subtitle2" color="text.secondary" fontWeight="medium" gutterBottom>
        {title}
      </Typography>
      {subValue && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          {subValue}
        </Typography>
      )}
      {progress !== undefined && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: `${color}20`,
              "& .MuiLinearProgress-bar": {
                backgroundColor: color,
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}
    </Box>
  </Card>
);

export default function StatsOverview({
  completedToday,
  totalHabits,
  currentStreak,
  totalCompletions,
}: StatsOverviewProps) {
  const progressValue = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Today's Progress"
          value={`${completedToday}/${totalHabits}`}
          subValue={totalHabits > 0 ? `${Math.round(progressValue)}% completed` : "No habits added"}
          icon={<TodayIcon />}
          color="#6366F1" // Indigo Breeze Primary
          progress={progressValue}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Current Streak"
          value={`${currentStreak} days`}
          subValue="Keep it going!"
          icon={<LocalFireDepartmentIcon />}
          color="#F59E0B" // Amber for streaks
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <StatCard
          title="Total Completions"
          value={totalCompletions}
          subValue="All-time stats"
          icon={<CheckCircleIcon />}
          color="#10B981" // Indigo Breeze Success (Emerald)
        />
      </Grid>
    </Grid>
  );
}
