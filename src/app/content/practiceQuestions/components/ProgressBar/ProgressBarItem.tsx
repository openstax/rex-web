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
    ${(props: { withLightLine: boolean }) => {
      if (props.withLightLine) {
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
`;

// tslint:disable-next-line: variable-name
const StyledActiveItem = styled(StyledItem)`
  color: ${theme.color.primary.gray.base};
  background-color: ${theme.color.neutral.base};
`;

// tslint:disable-next-line: variable-name
const StyledDisabledItem = styled(StyledItem)`
  color: #c1c1c1;
  background-color: #f1f1f1;
  border-color: #f1f1f1;
`;

interface ProgressBarItemProps {
  value: number;
  isActive: boolean;
  isDisabled: boolean;
}

// tslint:disable-next-line: variable-name
const ProgressBarItem = ({ value, isActive, isDisabled }: ProgressBarItemProps) => (
  <StyledItemWrapper withLightLine={isActive || isDisabled}>
    {
      isActive
        ? <StyledActiveItem>{value}</StyledActiveItem>
        : isDisabled
          ? <StyledDisabledItem>{value}</StyledDisabledItem>
          : <StyledItem>{value}</StyledItem>
    }
  </StyledItemWrapper>
);

export default ProgressBarItem;
