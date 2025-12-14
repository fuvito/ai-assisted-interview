import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material'

import type { ReportCardItem } from '../types'

type Props = {
  reportCard: ReportCardItem[]
}

export function ReportCard({ reportCard }: Props) {
  const averageScore = reportCard.length
    ? Math.round((reportCard.reduce((sum, item) => sum + item.review.evaluation.score, 0) / reportCard.length) * 10) / 10
    : 0

  if (reportCard.length === 0) return null

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Report card
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average score: {averageScore} / 10
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={2}>
            {reportCard.map((item) => (
              <Card
                key={`${item.review.question.id}-${item.questionIndex}`}
                variant="outlined"
                sx={{ boxShadow: 'none' }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle1" fontWeight={800}>
                        Q{item.questionIndex} / {item.totalQuestions}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {item.review.evaluation.score} / 10
                      </Typography>
                    </Box>

                    <Typography variant="body2" fontWeight={700}>
                      {item.review.question.questionText}
                    </Typography>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Your answer
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {item.review.userAnswer}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        What went wrong / feedback
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {item.review.evaluation.feedback}
                      </Typography>
                    </Box>

                    {item.review.evaluation.strengths && item.review.evaluation.strengths.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Strengths
                        </Typography>
                        <Stack spacing={0.5}>
                          {item.review.evaluation.strengths.map((s, idx) => (
                            <Typography key={idx} variant="body2">
                              - {s}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {item.review.evaluation.keyPointsExpected && item.review.evaluation.keyPointsExpected.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Key points expected
                        </Typography>
                        <Stack spacing={0.5}>
                          {item.review.evaluation.keyPointsExpected.map((kp, idx) => (
                            <Typography key={idx} variant="body2">
                              - {kp}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {item.review.evaluation.keyPointsCovered && item.review.evaluation.keyPointsCovered.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Key points you covered
                        </Typography>
                        <Stack spacing={0.5}>
                          {item.review.evaluation.keyPointsCovered.map((kp, idx) => (
                            <Typography key={idx} variant="body2">
                              - {kp}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {item.review.evaluation.keyPointsMissing && item.review.evaluation.keyPointsMissing.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Key points missing
                        </Typography>
                        <Stack spacing={0.5}>
                          {item.review.evaluation.keyPointsMissing.map((kp, idx) => (
                            <Typography key={idx} variant="body2">
                              - {kp}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Reference answer
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {item.review.referenceAnswer}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
