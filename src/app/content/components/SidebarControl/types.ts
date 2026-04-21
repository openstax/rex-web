export interface InnerProps {
  isOpen: boolean | null;
  message: string;
  onClick: () => void;
  className?: string;
  isActive?: boolean;
  'aria-expanded'?: React.AriaAttributes['aria-expanded'];
  'aria-controls'?: React.AriaAttributes['aria-controls'];
}

export interface MiddleProps {
  isOpen: boolean | null;
  open: () => void;
  close: () => void;
  showActivatedState?: boolean;
}
