export interface User {
  firstName: string;
  lastName: string;
  uuid: string;
  faculty_status?: string;
  isNotGdprLocation: boolean;
}

export interface State {
  user: User | undefined;
  established: boolean;
}
