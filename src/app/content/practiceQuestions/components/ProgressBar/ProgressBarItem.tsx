import React from 'react';
import styled, { AnyStyledComponent,  css } from 'styled-components/macro';
import theme from '../../../../theme';

const StyledItemWrapper = styled.li`
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

const StyledActiveItem = styled(StyledItem as AnyStyledComponent)`
  color: ${theme.color.primary.gray.base};
  background-color: ${theme.color.neutral.base};
`;

const StyledDisabledItem = styled(StyledItem as AnyStyledComponent)`
  color: #6e6e6e;
  background-color: #f1f1f1;
  border-color: #f1f1f1;
`;

interface ProgressBarItemProps {
  value: number;
  isActive: boolean;
  isDisabled: boolean;
}

const ProgressBarItem = ({ value, isActive, isDisabled }: ProgressBarItemProps) => (
  <StyledItemWrapper aria-current={isActive ? 'true' : undefined} withLightLine={isActive || isDisabled}>
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
