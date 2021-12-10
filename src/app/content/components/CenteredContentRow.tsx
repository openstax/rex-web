import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import theme from '../../theme';
import { setContentAdditionalPadding } from '../utils/domUtils';
import { contentWrapperMaxWidth } from './constants';

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  grid-column: 1 / -1;
  grid-row: 1;
  justify-self: center;
  width: 100%;
  overflow: visible; /* so sidebar position: sticky works */
  margin: 0 auto;
  max-width: ${contentWrapperMaxWidth}rem;
  ${theme.breakpoints.mobile(css`
    grid-column-start: 2;
    /* override js inline style adding additional padding */
    padding-left: 0 !important;
  `)}
  ${theme.breakpoints.mobileMedium(css`
    grid-column: 1 / -1;
  `)}

  @media screen {
    min-height: 100%;
    display: flex;
    flex-direction: row;
  }
`;

// tslint:disable-next-line: variable-name
const CenteredContentRow: React.FunctionComponent = ({ children }) => {
  const elementRef = React.createRef<HTMLElement>();

  React.useEffect(() => {
    const element = elementRef.current;

    if (!element || typeof(window) === 'undefined') {
      return;
    }

    const {callback, deregister} = setContentAdditionalPadding(element, window);
    callback();

    return deregister;
  }, [elementRef]);

  return <Wrapper data-testid='centered-content-row' ref={elementRef}>
    {children}
  </Wrapper>;
};

export default CenteredContentRow;
