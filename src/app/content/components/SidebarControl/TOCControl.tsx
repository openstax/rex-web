import React from 'react';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import TocIcon from '../../../../assets/TocIcon';
import * as selectors from '../../selectors';
import * as actions from '../../actions';
import { AppState, Dispatch } from '../../../types';
import type { InnerProps, MiddleProps } from './types';
import { OpenButton, ButtonText } from './Buttons';

const closedTocMessage = 'i18n:toc:toggle:closed';
const openTocMessage = 'i18n:toc:toggle:opened';

export const TOCControl = ({ message, children, ...props }: React.PropsWithChildren<InnerProps>) =>
  <OpenButton
    aria-label={useIntl().formatMessage({ id: message })}
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

export const lockTocControlState = (isOpen: boolean, Control: React.ComponentType<InnerProps>) =>
  tocConnector(({open, close, ...props}: MiddleProps) => <Control
    {...props}
    data-testid='toc-button'
    message={isOpen ? openTocMessage : closedTocMessage}
    data-analytics-label={isOpen ? 'Click to close the Table of Contents' : 'Click to open the Table of Contents'}
    onClick={isOpen ? close : open}
    isActive={false}
  />);
