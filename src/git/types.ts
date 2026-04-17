export interface Commit {
  hash: string;
  author: string;
  email: string;
  date: Date;
  message: string;
}

export interface ContributorActivity {
  author: string;
  email: string;
  commits: Commit[];
}
