import React from 'react';
import styled from 'styled-components/macro';
import theme from '../../../../theme';

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
  <StyledItem isActive={isActive} isDisabled={isDisabled}>
    {value}
  </StyledItem>
);

export default ProgressBarItem;
