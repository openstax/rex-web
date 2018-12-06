import React, { Component } from 'react';
import scrollTo from '../../helpers/scrollTo';
import { MAIN_CONTENT_ID, Provider } from '../context/SkipToContent';
import HiddenLink from './HiddenLink';

export default class SkipToContentWrapper extends Component {
  public mainContent: HTMLDivElement | undefined;

  public render() {
    return <Provider value={{registerMainContent: this.registerMainContent}}>
      <HiddenLink onClick={this.scrollToTarget} href={`#${MAIN_CONTENT_ID}`} tabIndex={1}>Skip to Content</HiddenLink>
      {this.props.children}
    </Provider>;
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
