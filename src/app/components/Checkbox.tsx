import React from 'react';
import styled, { AnyStyledComponent, css } from 'styled-components/macro';
import { Check } from 'styled-icons/fa-solid/Check';
import theme, { defaultFocusOutline } from '../theme';
import { disabledStyle } from './Typography';

const CheckIcon = styled(Check as AnyStyledComponent)`
  color: ${theme.color.white};
  height: 1rem;
  width: 1rem;
  display: none;
`;

interface Props {
  className?: string;
  checked?: boolean;
  disabled?: boolean;
}

const CustomCheckbox = styled(
  ({className}: {className?: string}) => <span className={className}><CheckIcon /></span>
)`
  height: 1.6rem;
  width: 1.6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  input:not(:checked) + & {
    border: 1px solid ${theme.color.primary.gray.darker};
  }

  input:checked + & {
    background-color: ${theme.color.primary.orange.darkest};
  }

  input:checked + & ${CheckIcon} {
    display: block;
  }
`;

const Checkbox = ({children, className, ...props}: React.PropsWithChildren<Props>) => <label className={className}>
  <input type='checkbox' {...props} />
  <CustomCheckbox />
  {children}
</label>;

export default styled(Checkbox as AnyStyledComponent)`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  ${(props) => props.disabled ? disabledStyle : null}

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  ${css`
    &:focus-within {
      border-radius: 0.4rem;
      background-color: ${theme.color.neutral.pageBackground};
      ${defaultFocusOutline}

      ${CustomCheckbox} {
        border: 1px solid ${theme.color.primary.orange.darkest};
      }
    }
    &.focus-within {
      border-radius: 0.4rem;
      background-color: ${theme.color.neutral.pageBackground};

      ${CustomCheckbox} {
        border: 1px solid ${theme.color.primary.orange.darkest};
      }
    }
  `}
`;
