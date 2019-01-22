import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import scrollTo from '../../helpers/scrollTo';
import { MAIN_CONTENT_ID, Provider } from '../context/SkipToContent';
import MessageProvider from '../MessageProvider';
import HiddenLink from './HiddenLink';

export default class SkipToContentWrapper extends Component {
  public mainContent: HTMLDivElement | undefined;

  public render() {
    return <MessageProvider>
      <Provider value={{registerMainContent: this.registerMainContent}}>
        <FormattedMessage id='i18n:a11y:skipToContent'>
          {(txt) => (
              <HiddenLink onClick={this.scrollToTarget} href={`#${MAIN_CONTENT_ID}`}>{txt}</HiddenLink>
          )}
        </FormattedMessage>
        {this.props.children}
      </Provider>
    </MessageProvider>;
  }

  private scrollToTarget = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (this.mainContent) {
      event.preventDefault();
      scrollTo(this.mainContent);
    } else {
      throw new Error(`BUG: Expected mainComponent to be defined. Does SkipToContentWrapper contain a MainContent?`);
    }
  }

  private registerMainContent = (mainContent: HTMLDivElement | null) => {
    if (mainContent) {
      this.mainContent = mainContent;
    }
  }
}
