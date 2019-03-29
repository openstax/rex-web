import styled, { css } from 'styled-components';
import theme from '../../theme';

export const wrapperPadding = css`
  padding: 0 ${theme.padding.page.desktop}rem;
  ${theme.breakpoints.mobile(css`
    padding: 0 ${theme.padding.page.mobile}rem;
  `)}
`;

export default styled.div`
  position: relative; /* for sidebar overlay */
  overflow: visible; /* so sidebar position: sticky works */
  min-height: 100%;
  width: 100%;
  ${wrapperPadding}
`;
