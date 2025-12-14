import { AppBar, Box, Button, Link, Toolbar, Typography } from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth'

export function NavBar() {
  const { accessToken, userEmail, signOut } = useAuth()
  const navigate = useNavigate()

  const homeTo = accessToken ? '/questions' : '/'

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Link
          component={RouterLink}
          to={homeTo}
          underline="none"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}
        >
          <AdminPanelSettingsIcon />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              AI Assisted Interview Admin
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              Content management
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {accessToken ? (
            <>
              <Button component={RouterLink} to="/account" color="inherit">
                Account
              </Button>
              <Button component={RouterLink} to="/about" color="inherit">
                About
              </Button>
              <Button
                color="inherit"
                onClick={async () => {
                  await signOut()
                  navigate('/')
                }}
              >
                Logout
              </Button>
              {userEmail && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {userEmail}
                </Typography>
              )}
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/about" color="inherit">
                About
              </Button>
              <Button component={RouterLink} to="/login" color="inherit">
                Login
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
