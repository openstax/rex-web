export interface User {
  firstName: string;
  lastName: string;
  uuid: string;
  isNotGdprLocation: boolean;
}

export interface State {
  user: User | undefined;
  established: boolean;
}
