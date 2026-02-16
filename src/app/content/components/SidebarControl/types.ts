export interface InnerProps {
  isOpen: boolean | null;
  message: string;
  onClick: () => void;
  className?: string;
  isActive?: boolean;
}

export interface MiddleProps {
  isOpen: boolean | null;
  open: () => void;
  close: () => void;
  showActivatedState?: boolean;
}
