import styled, { css } from 'styled-components';
import theme from '../../theme';

export default styled.div`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */
  min-height: 100%;
  width: 100%;
  background-color: ${theme.color.neutral.base};

  padding: ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: ${theme.padding.page.mobile}rem;
  `)}
`;
