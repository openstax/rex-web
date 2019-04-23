export interface User {
  name: string;
}

export interface State {
  user: User | undefined;
  established: boolean;
}
