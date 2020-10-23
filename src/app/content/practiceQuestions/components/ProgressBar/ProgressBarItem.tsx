import React from 'react';
import styled, { css } from 'styled-components/macro';
import theme from '../../../../theme';

// tslint:disable-next-line: variable-name
const StyledItemWrapper = styled.span`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  &::after {
    content: "";
    display: block;
    height: 0.1rem;
    width: 5.6rem;
    background-color: ${theme.color.primary.gray.base};
    ${(props: { isActiveOrDisabled: boolean }) => {
      if (props.isActiveOrDisabled) {
        return 'background-color: #F1F1F1;';
      }
    }}
  }

  &:last-child {
    &::after {
      content: none;
    }
  }

  ${theme.breakpoints.mobile(css`
    &::after {
      width: 3.3rem;
    }
  `)}
`;

// tslint:disable-next-line: variable-name
const StyledItem = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background-color: ${theme.color.primary.gray.base};
  border: 1px solid ${theme.color.primary.gray.base};
  color: ${theme.color.neutral.base};
  margin: 0 0.4rem;
  font-weight: bold;
  ${(props: { isActive: boolean, isDisabled: boolean }) => {
    if (props.isActive) {
      return `
        color: ${theme.color.primary.gray.base};
        background-color: ${theme.color.neutral.base};
      `;
    } else if (props.isDisabled) {
      return `
        color: #C1C1C1;
        background-color: #F1F1F1;
        border-color: #F1F1F1;
      `;
    }
  }}
`;

interface ProgressBarItemProps {
  value: number;
  isActive: boolean;
  isDisabled: boolean;
}

// tslint:disable-next-line: variable-name
const ProgressBarItem = ({ value, isActive, isDisabled }: ProgressBarItemProps) => (
  <StyledItemWrapper isActiveOrDisabled={isDisabled || isActive}>
    <StyledItem isActive={isActive} isDisabled={isDisabled}>
      {value}
    </StyledItem>
  </StyledItemWrapper>
);

export default ProgressBarItem;
