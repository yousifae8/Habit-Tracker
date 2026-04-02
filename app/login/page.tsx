'use client'

import { Container, Typography, TextField, Box, Button, Alert } from "@mui/material"
import { useState } from "react"
import { useRouter } from "next/navigation"
import * as yup from "yup"
import { useFormik } from "formik"
import { supabase } from "../supabase";
import Link from "next/link";

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required"),
});

type FormValues = {
  email: string
  password: string
}

const Login = () => {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema,
    onSubmit: async ({ email, password }) => {
      setLoginError(null);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) {
          setLoginError(error.message);
          return;
        }
        if (data.session) {
          router.push("/dashboard");
        }
      } catch (err: any) {
        setLoginError(err.message || "An unexpected error occurred");
      }
    }
  })

  return (
    <Container>
      <Box
        sx={{
          height: 600,
          width: 500,
          margin: "auto",
          padding: 3,
          mt: 20,
          borderRadius: 1,
          boxShadow: 5,
          paddingTop: 10,
        }}
      >
        <Box>
          <Typography fontSize={32} sx={{ textAlign: "center" }}>
            Login
          </Typography>
        </Box>
        <form onSubmit={formik.handleSubmit}>
          {loginError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {loginError}
            </Alert>
          )}
          <Box>
            <TextField
              fullWidth
              sx={{ mt: 5 }}
              variant="outlined"
              id="outlined-email-input"
              label="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              onBlur={formik.handleBlur}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              sx={{ mt: 5 }}
              variant="outlined"
              id="outlined-password-input"
              label="Password"
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              onBlur={formik.handleBlur}
            />
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Button type="submit" color="primary" variant="contained" sx={{ marginTop: 8 }} fullWidth disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Typography>Don&apos;t have an account? <Link href={"/register"}>sign up</Link></Typography>
          </Box>
        </form>
      </Box>
    </Container>
  )
}

export default Login