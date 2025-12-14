export type CandidateProfile = {
  id: string;
  name: string;
};

export type SubjectId = "java" | "typescript";

export type Subject = {
  id: SubjectId;
  name: string;
};

export type Question = {
  id: string;
  subjectId: SubjectId;
  questionText: string;
  expertAnswer: string;
};
