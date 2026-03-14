import React from 'react';
import classNames from 'classnames';
import styled from 'styled-components/macro';
import { PlainButton } from './Button';
import Dropdown, { DropdownList, DropdownProps } from './Dropdown';
import './DotMenu.css';

/**
 * Three-dot vertical menu icon (ellipsis).
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function DotMenuIconBase({ className, ...props }: React.SVGAttributes<SVGSVGElement>) {
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

export const DotMenuIcon = styled(DotMenuIconBase)``;

interface DotMenuToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
}

const DotMenuToggleBase = React.forwardRef<HTMLButtonElement, DotMenuToggleProps>(
  function DotMenuToggleBase({ isOpen = false, className, ...props }, ref) {
    return (
      <PlainButton
        className={classNames('dot-menu-toggle', className)}
        aria-label="Actions"
        aria-expanded={isOpen}
        {...props}
        ref={ref}
      >
        <div tabIndex={-1}>
          <DotMenuIcon />
        </div>
      </PlainButton>
    );
  }
);

export const DotMenuToggle = styled(DotMenuToggleBase)``;

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

export type DotMenuDropdownProps = Omit<DropdownProps, 'children' | 'toggle'> & {
  children?: React.ReactNode;
  toggle?: React.ReactNode;
};

export function DotMenuDropdown({ className, children, toggle, ...props }: DotMenuDropdownProps) {
  return (
    <Dropdown
      className={classNames('dot-menu-dropdown', className)}
      toggle={toggle || <DotMenuToggle isOpen={false} />}
      {...props}
    >
      {children}
    </Dropdown>
  );
}
