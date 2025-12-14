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
            Admin
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            Manage subjects and questions for the AI Assisted Interview platform.
          </Typography>
        </Box>

        <CardContent>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Sign in to access question management tools.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {accessToken ? (
                <Button component={RouterLink} to="/questions" variant="contained">
                  Go to questions
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
