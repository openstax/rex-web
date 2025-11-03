import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { useOnEsc, useOnKey } from '../../../reactUtils';
import theme from '../../../theme';
import Modal from '../../components/Modal';
import { bookTheme as bookThemeSelector } from '../../selectors';
import { CloseIcon, CloseIconWrapper, Header } from '../../styles/PopupStyles';
import { closeKeyboardShortcutsMenu, openKeyboardShortcutsMenu } from '../actions';
import * as ksSelectors from '../selectors';
import ShowKeyboardShortcuts from './ShowKeyboardShortcuts';

// tslint:disable-next-line:variable-name
const StyledModal = styled(Modal)`
  max-width: 92.8rem;
`;

// tslint:disable-next-line: variable-name
const KeyboardShortcutsPopup = () => {
  const dispatch = useDispatch();
  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenCloseKS = useAnalyticsEvent('openCloseKeyboardShortcuts');
  const isKeyboardShortcutsOpen = useSelector(ksSelectors.isKeyboardShortcutsOpen);
  const bookTheme = useSelector(bookThemeSelector);
  const intl = useIntl();

  const openAndTrack = () => {
    dispatch(openKeyboardShortcutsMenu());
    trackOpenCloseKS();
  };
  useOnKey({key: '?', shiftKey: true}, null, !isKeyboardShortcutsOpen, openAndTrack);

  const closeAndTrack = React.useCallback((method: string) => () => {
    dispatch(closeKeyboardShortcutsMenu());
    trackOpenCloseKS(method);
  }, [trackOpenCloseKS, dispatch]);
  useOnEsc(isKeyboardShortcutsOpen, closeAndTrack('esc'));

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && isKeyboardShortcutsOpen) {
      popUp.focus();
    }
  }, [isKeyboardShortcutsOpen]);

  return isKeyboardShortcutsOpen ?
    <StyledModal
      ref={popUpRef}
      tabIndex='-1'
      data-testid='keyboard-shortcuts-popup-wrapper'
      scrollLockProps={{
        mediumScreensOnly: false,
        onClick: closeAndTrack('overlay'),
        overlay: true,
        zIndex: theme.zIndex.keyboardShortcutsPopup,
      }}
    >
      <Header colorSchema={bookTheme}>
        <h1 id='modal-title'>
          <FormattedMessage id='i18n:a11y:keyboard-shortcuts:heading'>
            {(msg) => msg}
          </FormattedMessage>
        </h1>
        <CloseIconWrapper
          data-testid='close-keyboard-shortcuts-popup'
          aria-label={intl.formatMessage({id: 'i18n:a11y:keyboard-shortcuts:close'})}
          data-analytics-label='Click to close Keyboard Shortcuts modal'
          onClick={closeAndTrack('button')}
        >
          <CloseIcon colorSchema={bookTheme} />
        </CloseIconWrapper>
      </Header>
      <ShowKeyboardShortcuts />
    </StyledModal>
  : null;
};

export default KeyboardShortcutsPopup;
