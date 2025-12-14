import { Card, CardContent, Container, Stack, Typography } from '@mui/material'

import { useAuth } from '../auth'

export function Account() {
  const { userEmail } = useAuth()

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={800}>
              Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userEmail || 'Unknown user'}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
