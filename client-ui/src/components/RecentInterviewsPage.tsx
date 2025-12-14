import { useEffect, useState } from 'react'
import { Alert, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { getRecentInterviews, removeRecentInterview } from '../recentInterviews'
import { useSubjects } from '../subjects'
import { RecentInterviewsCard } from './RecentInterviewsCard'

export function RecentInterviewsPage() {
  const { subjects } = useSubjects()
  const navigate = useNavigate()

  const [items, setItems] = useState(() => getRecentInterviews())
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarError, setSnackbarError] = useState(false)
  const [deleteInterviewId, setDeleteInterviewId] = useState<string | null>(null)

  useEffect(() => {
    function refresh() {
      setItems(getRecentInterviews())
    }

    refresh()

    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={900}>
          Recent interviews
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          This list is stored locally in your browser.
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Alert severity="info">No recent interviews yet.</Alert>
      ) : (
        <RecentInterviewsCard
          items={items}
          subjects={subjects}
          onResume={(interviewId) => {
            localStorage.setItem('lastInterviewId', interviewId)
            navigate(`/interview/resume/${encodeURIComponent(interviewId)}`)
          }}
          onCopyId={async (interviewId) => {
            try {
              await navigator.clipboard.writeText(interviewId)
              setSnackbarError(false)
              setSnackbarOpen(true)
            } catch {
              setSnackbarError(true)
              setSnackbarOpen(true)
            }
          }}
          onRemove={(interviewId) => {
            setDeleteInterviewId(interviewId)
          }}
        />
      )}

      <Dialog open={Boolean(deleteInterviewId)} onClose={() => setDeleteInterviewId(null)}>
        <DialogTitle>Delete recent interview?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This removes the entry from your local list only.
          </Typography>
          {deleteInterviewId && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {deleteInterviewId}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteInterviewId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!deleteInterviewId) return
              removeRecentInterview(deleteInterviewId)
              setItems(getRecentInterviews())
              setDeleteInterviewId(null)
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbarError ? 'error' : 'success'} onClose={() => setSnackbarOpen(false)}>
          {snackbarError ? 'Failed to copy' : 'Interview id copied'}
        </Alert>
      </Snackbar>
    </Container>
  )
}
