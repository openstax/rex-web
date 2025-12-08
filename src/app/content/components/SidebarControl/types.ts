export interface InnerProps {
  isOpen: boolean | null;
  message: string;
  onClick: () => void;
  className?: string;
  isActive?: boolean | null;
}

export interface MiddleProps {
  isOpen: boolean | null;
  open: () => void;
  close: () => void;
  showActivatedState?: boolean;
}
