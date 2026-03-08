"use client";

import { Alert, Box, Button, TextField } from "@mui/material";
import { useFormik } from "formik";
import { useState } from "react";
import * as yup from "yup";

type HabitFormProps = {
  initialValues?: FormValues;
  submitLabel?: string;
  onSubmit: (values: FormValues) => Promise<void>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type FormValues = {
  name: string;
  description: string;
};

const validationSchema = yup.object({
  name: yup.string().trim().required("Name is required"),
  description: yup.string().optional(),
});

const HabitForm = ({
  initialValues,
  submitLabel = "Save Habit",
  onSubmit,
  onSuccess,
  onCancel,
}: HabitFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    enableReinitialize: true,
    initialValues: initialValues ?? { name: "", description: "" },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null);
      try {
        await onSubmit({
          name: values.name.trim(),
          description: values.description.trim(),
        });
        helpers.resetForm();
        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save habit";
        setSubmitError(message);
      }
    },
  });

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{ display: "grid", gap: 2, mt: 1 }}
    >
      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <TextField
        required
        fullWidth
        id="habit-name"
        name="name"
        label="Habit Name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name ? formik.errors.name : ""}
      />

      <TextField
        fullWidth
        id="habit-description"
        name="description"
        label="Description (Optional)"
        multiline
        minRows={3}
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description ? formik.errors.description : ""}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button type="button" variant="text" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
          {formik.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </Box>
    </Box>
  );
};

export default HabitForm;
