import React from 'react';
import styled, { AnyStyledComponent, css } from 'styled-components/macro';
import { EllipsisV } from 'styled-icons/fa-solid/EllipsisV';
import theme from '../theme';
import { PlainButton } from './Button';
import Dropdown, { DropdownList, DropdownProps } from './Dropdown';

export const DotMenuIcon = styled(EllipsisV as AnyStyledComponent)`
  height: 2rem;
  width: 2rem;
  padding: 0.2rem;
  color: ${theme.color.primary.gray.darker};
  user-select: none;

  &:hover {
    color: ${theme.color.secondary.lightGray.darkest};
  }
`;

export const DotMenuToggle = styled(
  React.forwardRef<HTMLButtonElement, {isOpen: boolean}>(
    ({isOpen, ...props}, ref) => {

      return (
        <PlainButton aria-label='Actions' aria-expanded={isOpen} {...props} ref={ref}>
          <div tabIndex={-1}>
            <DotMenuIcon />
          </div>
        </PlainButton>
      );
    }
  ) as AnyStyledComponent
)`
  border: none;
  display: block;

  > div {
    display: inline-block;
    outline: none;
  }
`;

type DropdownListProps = {rightAlign?: boolean}
export const DotMenuDropdownList = styled(DropdownList as AnyStyledComponent)<DropdownListProps>`
  && {
    ${(props) => {
      return props.rightAlign === true
        ? css`right: 0; left: unset`
        : css`left: 0; right: unset`
      ;
    }}
  }
` as React.ComponentType<DropdownListProps>;

export const DotMenuDropdown = styled((props: React.PropsWithChildren<DropdownProps>) =>
  <Dropdown {...props} toggle={<DotMenuToggle />} />)`
  .focus-within ${DotMenuIcon} {
    color: ${theme.color.primary.gray.base};
  }

  :focus-within ${DotMenuIcon} {
    color: ${theme.color.primary.gray.base};
  }
` as React.ComponentType<React.PropsWithChildren<DropdownProps>>;
