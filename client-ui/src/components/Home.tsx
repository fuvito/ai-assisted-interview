import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../auth'

export function Home() {
  const { accessToken } = useAuth()

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Card variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: { xs: 3, sm: 4 },
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="h3" fontWeight={900}>
            AI Assisted Interview
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            Practice technical interviews and receive structured, semantic feedback.
          </Typography>
        </Box>

        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Choose a subject, answer questions, and get a report card with strengths and missing key points.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {accessToken ? (
                <Button component={RouterLink} to="/dashboard" variant="contained">
                  Go to dashboard
                </Button>
              ) : (
                <Button component={RouterLink} to="/login" variant="contained">
                  Login
                </Button>
              )}
              <Button component={RouterLink} to="/about" variant="outlined">
                About
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
