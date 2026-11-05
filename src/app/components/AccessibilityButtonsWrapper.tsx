import { HTMLDivElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../helpers/analytics';
import { openKeyboardShortcutsMenu as openKeyboardShortcutsMenuAction } from '../content/keyboardShortcuts/actions';
import { MAIN_CONTENT_ID } from '../context/constants';
import { Provider } from '../context/SkipToContent';
import { scrollTo } from '../domUtils';
import { isPortaled } from '../guards';
import * as selectNavigation from '../navigation/selectors';
import HiddenLink, { HiddenButton } from './HiddenLink';
import { captureOpeningElement } from '../content/utils/focusManager';

const OpenKeyboardShortcutsMenuLink = () => {
  const dispatch = useDispatch();
  const trackOpenCloseKS = useAnalyticsEvent('openCloseKeyboardShortcuts');

  const openKeyboardShortcutsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    captureOpeningElement('keyboardshortcuts');
    dispatch(openKeyboardShortcutsMenuAction());
    trackOpenCloseKS();
  };

  return <FormattedMessage id='i18n:a11y:keyboard-shortcuts:menu'>
    {/* TODO - use url based modal control */}
    {(txt) => <HiddenButton onClick={openKeyboardShortcutsMenu}>{txt}</HiddenButton>}
  </FormattedMessage>;
};

// Every language links to the English page, inside the reader's portal if they are in one
const AccessibilityHelpLink = () => {
  const params = useSelector(selectNavigation.params);
  const href = isPortaled(params)
    ? `https://openstax.org/${params.portalName}/accessibility-statement`
    : 'https://openstax.org/accessibility-statement';

  return <FormattedMessage id='i18n:a11y:accessibilityHelp'>
    {(txt) => <HiddenLink href={href} target='_blank' rel='noopener'>{txt}</HiddenLink>}
  </FormattedMessage>;
};

export default class AccessibilityButtonsWrapper extends Component {
  public mainContent: HTMLDivElement | undefined;

  public render() {
    return <Provider value={{ registerMainContent: this.registerMainContent }}>
      <FormattedMessage id='i18n:a11y:skipToContent'>
        {(txt) => <HiddenLink onClick={this.scrollToTarget} href={`#${MAIN_CONTENT_ID}`}>{txt}</HiddenLink>}
      </FormattedMessage>
      <AccessibilityHelpLink />
      <OpenKeyboardShortcutsMenuLink />
      {this.props.children}
    </Provider>;
  }

  private scrollToTarget = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (this.mainContent) {
      event.preventDefault();
      scrollTo(this.mainContent);
      this.mainContent.focus();
    } else {
      throw new Error(
        `BUG: Expected mainComponent to be defined. Does AccessibilityButtonsWrapper contain a MainContent?`);
    }
  };

  private registerMainContent = (mainContent: HTMLDivElement | null) => {
    if (mainContent) {
      this.mainContent = mainContent;
    }
  };
}