import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'

export default function App() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Client UI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Material UI is installed and working.
              </Typography>
            </Box>

            <Button variant="contained">Client-ui works</Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
