"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { Button ,Typography} from "@mui/material";
import { TextField } from "@mui/material";
import { Container, Box } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import * as yup from "yup";
import { useFormik } from "formik";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .min(2, "Name must be at least 2 characters")
      .matches(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
      .required("Name is required"),

    username: yup
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .matches(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      )
      .required("Username is required"),

    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),

    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/[0-9]/, "Must contain at least one number")
      .matches(
        /[@$!%*?&]/,
        "Must contain at least one special character (@$!%*?&)",
      )
      .required("Password is required"),

    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), undefined], "Passwords must match")
      .required("Confirm Password is required"),

    terms: yup.boolean().oneOf([true], "You must accept the terms"),
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    validationSchema,
    onSubmit: async (values: FormValues) => {
      try {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              username: values.username,
            },
          },
        });
        if (error) {
          console.log(error.message);
          return;
        }
        router.push("/signin");
      } catch (error) {
        console.error(error);
      }
    },
  });

  type FormValues = {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
  };

  return (
    <Container>
      <Box
        className={styles.form}
        sx={{
          height: 750,
          width: 500,
          margin: "auto",
          padding: 3,
          mt: 20,
          borderRadius: 1,
          boxShadow: 5,
          paddingTop: 10,
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            rowSpacing={5}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          >
            <Grid size={6}>
              <Box>
                <TextField
                  required
                  variant="outlined"
                  id="outlined-name-input"
                  label="Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  onBlur={formik.handleBlur}
                />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <TextField
                  required
                  variant="outlined"
                  id="outlined-username-input"
                  label="Username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                  onBlur={formik.handleBlur}
                />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <TextField
                  required
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
            </Grid>
            <Grid size={6}>
              <Box>
                <TextField
                  required
                  variant="outlined"
                  id="outlined-password-input"
                  label="Password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                  onBlur={formik.handleBlur}
                />
              </Box>
            </Grid>
            <Grid size={6}>
              <Box>
                <TextField
                  required
                  variant="outlined"
                  id="outlined-email-input"
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.confirmPassword &&
                    Boolean(formik.errors.confirmPassword)
                  }
                  helperText={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  }
                  onBlur={formik.handleBlur}
                />
              </Box>
            </Grid>
            <Box>
              <Checkbox
                required
                name="terms"
                checked={formik.values.terms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <span>
                I confirm I have read and agree to the{" "}
                <Link href={"register/terms"}>Terms & Conditions</Link>
              </span>
            </Box>
            {formik.touched.terms && formik.errors.terms && (
              <Box sx={{ color: "error.main", fontSize: 12, mt: 0.5 }}>
                {formik.errors.terms}
              </Box>
            )}
          </Grid>

          <Box sx={{ textAlign: "center" }}>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              sx={{  marginTop: 15 }}
              fullWidth
              disabled={!formik.isValid || formik.isSubmitting}
            >
              Submit
            </Button>
          </Box>
            <Box sx={{mt:4}}>
                                 <Typography>Have an account?<Link href={"/login"}>login</Link></Typography> 
                              </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Register;
