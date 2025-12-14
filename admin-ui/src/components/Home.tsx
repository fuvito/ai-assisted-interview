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
                Admin
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage subjects and questions for the AI Assisted Interview platform.
              </Typography>
            </Box>

            <Box>
              {accessToken ? (
                <Button component={RouterLink} to="/questions" variant="contained">
                  Go to questions
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
