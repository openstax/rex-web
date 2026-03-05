import React from 'react';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import TocIcon from '../../../../assets/TocIcon';
import * as selectors from '../../selectors';
import * as actions from '../../actions';
import { AppState, Dispatch } from '../../../types';
import type { InnerProps, MiddleProps } from './types';
import { OpenButton, ButtonText } from './Buttons';
import { useMatchMobileQuery } from '../../../reactUtils';

const closedTocMessage = 'i18n:toc:toggle:closed';
const openTocMessage = 'i18n:toc:toggle:opened';

export const TOCControl = ({ message, children, 'aria-expanded': ariaExpanded, 'aria-controls': ariaControls, ...props }: React.PropsWithChildren<InnerProps>) =>
  <OpenButton
    aria-label={useIntl().formatMessage({ id: message })}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    {...props}
  >
    <TocIcon />
    <ButtonText>
      {useIntl().formatMessage({ id: 'i18n:toolbar:toc:text' })}
    </ButtonText>
    {children}
  </OpenButton>;

export const tocConnector = connect(
  (state: AppState) => ({
      isOpen:  selectors.tocOpen(state),
  }),
  (dispatch: Dispatch) => ({
      close: () => dispatch(actions.closeToc()),
      open: () => dispatch(actions.openToc()),
  })
);

export function lockTocControlState(isOpen: boolean, Control: React.ComponentType<InnerProps>) {
  return tocConnector(({open, close, ...props}: MiddleProps) => <Control
    {...props}
    data-testid='toc-button'
    message={isOpen ? openTocMessage : closedTocMessage}
    data-analytics-label={isOpen ? 'Click to close the Table of Contents' : 'Click to open the Table of Contents'}
    onClick={isOpen ? close : open}
    isActive={false}
  />);
}

export function withMobileResponsiveTocControl(Control: React.ComponentType<InnerProps>) {
  return tocConnector(({open, close, ...props}: MiddleProps) => {
    // Note: This conditional hook call violates React's Rules of Hooks, but is necessary
    // because useMatchMobileQuery() calls assertWindow() which throws during SSR.
    // Since window never changes from defined to undefined during runtime, the hook
    // order remains consistent after the initial render. This pattern existed in the
    // original TOCControlButton implementation.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isMobile = typeof window !== 'undefined' && useMatchMobileQuery();
    const isOpen = props.isOpen === null ? !isMobile : props.isOpen;

    return <Control
      {...props}
      data-testid='toc-button'
      message={isOpen ? openTocMessage : closedTocMessage}
      onClick={isOpen ? close : open}
      isOpen={isOpen}
      aria-expanded={isOpen === true}
      aria-controls='toc-sidebar'
    />;
  });
}
