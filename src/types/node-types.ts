export interface Source {
  title: string;
  url: string;
  content: string;
}

export interface BaseNodeData {
  label: string;
  answer: string;
  sources?: Source[];
}

export interface Node {
  id: number;
  userId: string;
  projectId: number;
  answer: string;
  images: { url: string; description: string; }[];
  query: string;
  followupQuestions: string[];
  concepts: string[];
  results: { title: string; url: string; content: string; }[];
  embedding: number[] | null;
  createdAt: Date;
}
