import { Card, CardContent, Container, Typography } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../auth'

export function RequireAuth() {
  const { initialized, accessToken } = useAuth()
  const location = useLocation()

  if (!initialized) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              Loading…
            </Typography>
          </CardContent>
        </Card>
      </Container>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
