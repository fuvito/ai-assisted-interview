import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

import { useAuth } from '../auth'

export function Home() {
  const { accessToken } = useAuth()

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h3" fontWeight={900}>
                AI Assisted Interview
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Practice technical interviews and receive structured, semantic feedback.
              </Typography>
            </Box>

            <Box>
              {accessToken ? (
                <Button component={RouterLink} to="/dashboard" variant="contained">
                  Go to dashboard
                </Button>
              ) : (
                <Button component={RouterLink} to="/login" variant="contained">
                  Login
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
