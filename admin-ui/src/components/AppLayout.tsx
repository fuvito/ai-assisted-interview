import { Box, Container } from '@mui/material'
import { Outlet } from 'react-router-dom'

import { NavBar } from './NavBar'

export function AppLayout() {
  return (
    <Box>
      <NavBar />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Outlet />
      </Container>
    </Box>
  )
}
