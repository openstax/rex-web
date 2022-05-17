import { HTMLDivElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useAnalyticsEvent } from '../../helpers/analytics';
import { openKeyboardShortcutsMenu as openKeyboardShortcutsMenuAction } from '../content/keyboardShortcuts/actions';
import { MAIN_CONTENT_ID } from '../context/constants';
import { Provider } from '../context/SkipToContent';
import { scrollTo } from '../domUtils';
import HiddenLink from './HiddenLink';

// tslint:disable-next-line: variable-name
const OpenKeyboardShortcutsMenuLink = () => {
  const dispatch = useDispatch();
  const trackOpenCloseKS = useAnalyticsEvent('openCloseKeyboardShortcuts');

  const openKeyboardShortcutsMenu = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    dispatch(openKeyboardShortcutsMenuAction());
    trackOpenCloseKS();
  };

  return <FormattedMessage id='i18n:a11y:keyboard-shortcuts:menu'>
    {(txt) => <HiddenLink onClick={openKeyboardShortcutsMenu} href=''>{txt}</HiddenLink>}
  </FormattedMessage>;
};

export default class AccessibilityButtonsWrapper extends Component {
  public mainContent: HTMLDivElement | undefined;

  public render() {
    return <Provider value={{registerMainContent: this.registerMainContent}}>
      <FormattedMessage id='i18n:a11y:skipToContent'>
        {(txt) => <HiddenLink onClick={this.scrollToTarget} href={`#${MAIN_CONTENT_ID}`}>{txt}</HiddenLink>}
      </FormattedMessage>
      <FormattedMessage id='i18n:a11y:accessibilityHelp'>
        {(txt) => <FormattedMessage id='i18n:a11y:accessibilityHelp:link'>
          {(href) => <HiddenLink href={href}>{txt}</HiddenLink>}
        </FormattedMessage>}
      </FormattedMessage>
      <OpenKeyboardShortcutsMenuLink/>
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
