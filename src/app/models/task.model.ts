import { User } from './user.model';

export interface Task {
  name: string;
  status: string;
  deadline: number;
  owner: User;
  uid: string;
}

export enum Status {
  notStarted = 'not-started',
  inProgress = 'in-progress',
  completed = 'completed',
}
