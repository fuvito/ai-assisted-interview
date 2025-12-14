import { Box, Card, CardContent, Container, Link, Stack, Typography } from '@mui/material'

export function About() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                About
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin UI for managing interview content (subjects, questions, expert answers).
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Uses Supabase Auth for admin login and a backend that verifies JWTs + admin membership.
            </Typography>

            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Author
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fuat Yazar
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                <Link href="https://www.linkedin.com/in/fuatyazar/" target="_blank" rel="noreferrer">
                  LinkedIn
                </Link>
                <Link href="https://github.com/fuvito/ai-assisted-interview" target="_blank" rel="noreferrer">
                  GitHub
                </Link>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
