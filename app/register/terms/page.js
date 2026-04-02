import { Container, Box, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from "next/link";

const terms = () => {
  return (
    <Container>
      <Box sx={{ textAlign: "center" }}>
        <Typography fontSize={"64px"}>Terms and Conditions</Typography>
      </Box>
        <Link href="/register"><ArrowBackIcon sx={{mt:10}} /></Link>
      <Box sx={{ mt: 10, mb: 10 }}>Last Updated: 2026-02-22</Box>
      <Box>
        <Typography>
          Welcome to Habit Tracker Web App. These Terms and Conditions govern
          your use of our website and services. By creating an account or using
          our Service, you agree to these Terms. If you do not agree, please do
          not use the Service.
        </Typography>
      </Box>
      <Box sx={{ mt: 10 }}>
        <Typography fontSize={"24px"}>1. Eligibility</Typography>
        <Typography>
          You must be at least 13 years old to use our Service. By registering,
          you confirm that:
          <ul>
            <li>
              You are legally capable of entering into a binding agreement.
            </li>
            <li>The information you provide is accurate and complete.</li>
          </ul>
        </Typography>

        <Typography>
          <Typography fontSize={"24px"}>2. Account Registration</Typography>
          <Typography>
            To use certain features, you must create an account.
          </Typography>
          <Typography>You have to:</Typography>
          <ul>
            <li>Provide accurate and current information.</li>
            <li>Keep your login credentials secure.</li>
            <li>Notify us immediately of unauthorized access.</li>
          </ul>

          <Typography>
            We are not responsible for any loss resulting from unauthorized use
            of your account.
          </Typography>

          <Typography fontSize={"24px"} sx={{mt:1}}>3. Changes to Terms</Typography>

          <Typography>
            We may update these Terms from time to time. When we do:
            <ul>
              <li>We will update the “Last Updated” date.</li>
              <li>
                Continued use of the Service means you accept the revised Terms.
              </li>
            </ul>
          </Typography>
        </Typography>
      </Box>
    </Container>
  );
};

export default terms;
