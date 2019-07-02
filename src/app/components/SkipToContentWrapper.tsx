import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import scrollToContent from '../content/components/utils/scrollToContent';
import { MAIN_CONTENT_ID, Provider } from '../context/SkipToContent';
import HiddenLink from './HiddenLink';

export default class SkipToContentWrapper extends Component {
  public mainContent: HTMLDivElement | undefined;

  public render() {
    return <Provider value={{registerMainContent: this.registerMainContent}}>
      <FormattedMessage id='i18n:a11y:skipToContent'>
        {(txt) => <HiddenLink onClick={this.scrollToTarget} href={`#${MAIN_CONTENT_ID}`}>{txt}</HiddenLink>}
      </FormattedMessage>
      {this.props.children}
    </Provider>;
  }

  private scrollToTarget = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (this.mainContent) {
      event.preventDefault();
      scrollToContent(this.mainContent);
      this.mainContent.focus();
    } else {
      throw new Error(`BUG: Expected mainComponent to be defined. Does SkipToContentWrapper contain a MainContent?`);
    }
  };

  private registerMainContent = (mainContent: HTMLDivElement | null) => {
    if (mainContent) {
      this.mainContent = mainContent;
    }
  };
}
