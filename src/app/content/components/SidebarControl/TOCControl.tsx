import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import TocIcon from '../../../../assets/TocIcon';
import * as selectors from '../../selectors';
import * as actions from '../../actions';
import type { InnerProps } from './types';
import { OpenButton, ButtonText } from './Buttons';
import { useMatchMobileQuery } from '../../../reactUtils';

const closedTocMessage = 'i18n:toc:toggle:closed';
const openTocMessage = 'i18n:toc:toggle:opened';

export const TOCControl = ({
  message, children, 'aria-expanded': ariaExpanded, 'aria-controls': ariaControls, ...props
}: React.PropsWithChildren<InnerProps>) => {
  const intl = useIntl();
  return <OpenButton
    aria-label={intl.formatMessage({ id: message })}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    {...props}
  >
    <TocIcon />
    <ButtonText>
      {intl.formatMessage({ id: 'i18n:toolbar:toc:text' })}
    </ButtonText>
    {children}
  </OpenButton>;
};

export function lockTocControlState(isOpenLocked: boolean, Control: React.ComponentType<InnerProps>) {
  return (props: React.PropsWithChildren<Omit<InnerProps, 'isOpen' | 'message' | 'onClick'>>) => {
    const dispatch = useDispatch();
    const isOpen = useSelector(selectors.tocOpen);

    const close = () => dispatch(actions.closeToc());
    const open = () => dispatch(actions.openToc());

    return <Control
      {...props}
      isOpen={isOpen}
      data-testid='toc-button'
      message={isOpenLocked ? openTocMessage : closedTocMessage}
      data-analytics-label={isOpenLocked ? 'Click to close the Table of Contents' : 'Click to open the Table of Contents'}
      onClick={isOpenLocked ? close : open}
      isActive={false}
    />;
  };
}

export function withMobileResponsiveTocControl(Control: React.ComponentType<InnerProps>) {
  return ({ showActivatedState, ...props }: Omit<InnerProps, 'isOpen' | 'message' | 'onClick'> & { showActivatedState?: boolean }) => {
    const dispatch = useDispatch();
    const isOpenFromState = useSelector(selectors.tocOpen);
    const isMobile = useMatchMobileQuery();

    const close = () => dispatch(actions.closeToc());
    const open = () => dispatch(actions.openToc());

    const isOpen = isOpenFromState === null ? !isMobile : isOpenFromState;
    const isActive = showActivatedState ? isOpen : false;

    return <Control
      {...props}
      isOpen={isOpen}
      isActive={isActive}
      data-testid='toc-button'
      message={isOpen ? openTocMessage : closedTocMessage}
      onClick={isOpen ? close : open}
      aria-expanded={isOpen === true}
      aria-controls='toc-sidebar'
    />;
  };
}
