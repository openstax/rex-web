// A user who signed in to Accounts, with the profile Accounts gave us
export interface AccountsProfileUser {
  source: 'accounts';
  firstName: string;
  lastName: string;
  uuid: string;
  isNotGdprLocation: boolean;
}

// A user launched from Assignable; the launch token is their only credential
export interface LaunchUser {
  source: 'launch';
}

export type User = AccountsProfileUser | LaunchUser;

export interface State {
  user: User | undefined;
  established: boolean;
}
