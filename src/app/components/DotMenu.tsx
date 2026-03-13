import React from 'react';
import classNames from 'classnames';
import theme from '../theme';
import { PlainButton } from './Button';
import Dropdown, { DropdownList, DropdownProps } from './Dropdown';
import './DotMenu.css';

/**
 * Three-dot vertical menu icon (ellipsis).
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 */
export function DotMenuIcon({ className, ...props }: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      className={classNames('dot-menu-icon', className)}
      viewBox="0 0 192 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M96 184c39.8 0 72 32.2 72 72s-32.2 72-72 72-72-32.2-72-72 32.2-72 72-72zM24 80c0 39.8 32.2 72 72 72s72-32.2 72-72S135.8 8 96 8 24 40.2 24 80zm0 352c0 39.8 32.2 72 72 72s72-32.2 72-72-32.2-72-72-72-72 32.2-72 72z"
      />
    </svg>
  );
}

interface DotMenuToggleProps {
  isOpen: boolean;
  className?: string;
}

export const DotMenuToggle = React.forwardRef<HTMLButtonElement, DotMenuToggleProps>(
  function DotMenuToggle({ isOpen, className, ...props }, ref) {
    return (
      <PlainButton
        className={classNames('dot-menu-toggle', className)}
        aria-label="Actions"
        aria-expanded={isOpen}
        {...props}
        ref={ref}
        style={{
          '--dot-menu-color': theme.color.primary.gray.darker,
          '--dot-menu-hover-color': theme.color.secondary.lightGray.darkest,
          '--dot-menu-focus-color': theme.color.primary.gray.base,
        } as React.CSSProperties}
      >
        <div tabIndex={-1}>
          <DotMenuIcon />
        </div>
      </PlainButton>
    );
  }
);

interface DotMenuDropdownListProps {
  rightAlign?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function DotMenuDropdownList({ rightAlign, className, children, ...props }: DotMenuDropdownListProps) {
  return (
    <DropdownList
      className={classNames(
        'dot-menu-dropdown-list',
        { 'dot-menu-right-align': rightAlign },
        className
      )}
      {...props}
    >
      {children}
    </DropdownList>
  );
}

export function DotMenuDropdown({ className, ...props }: DropdownProps) {
  return (
    <Dropdown
      className={classNames('dot-menu-dropdown', className)}
      toggle={<DotMenuToggle isOpen={false} />}
      {...props}
      style={{
        '--dot-menu-color': theme.color.primary.gray.darker,
        '--dot-menu-hover-color': theme.color.secondary.lightGray.darkest,
        '--dot-menu-focus-color': theme.color.primary.gray.base,
        ...(props.style || {}),
      } as React.CSSProperties}
    />
  );
}
