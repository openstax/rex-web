import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { typesetMath } from '../../../../helpers/mathjax';
import { isHtmlElement } from '../../../guards';
import { assertWindow } from '../../../utils';
import Highlights from './Highlights';
import * as Styled from './ShowMyHighlightsStyles';
import Filters from './SummaryPopup/Filters';

class ShowMyHighlights extends Component<{}, { showGoToTop: boolean }> {
  public myHighlightsBodyRef = React.createRef<HTMLElement>();

  public state = { showGoToTop: false };

  private scrollHandler: (() => void) | undefined;

  public scrollToTop = () => {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (!highlightsBodyRef) {
      return;
    }

    highlightsBodyRef.scrollTop = 0;
  };

  public updateGoToTop = (bodyElement: HTMLElement) => () => {
    if (bodyElement.scrollTop > 0) {
      this.setState({ showGoToTop: true });
    } else {
      this.setState({ showGoToTop: false });
    }
  };

  public componentDidMount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (isHtmlElement(highlightsBodyRef)) {
      this.scrollHandler = this.updateGoToTop(highlightsBodyRef);
      highlightsBodyRef.addEventListener('scroll', this.scrollHandler);
      typesetMath(highlightsBodyRef, assertWindow());
    }

  }

  public componentWillUnmount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (this.scrollHandler && isHtmlElement(highlightsBodyRef)) {
      highlightsBodyRef.removeEventListener('scroll', this.scrollHandler);
    }
  }

  public render() {
    return (
      <Styled.ShowMyHighlightsBody
        ref={this.myHighlightsBodyRef}
        data-testid='show-myhighlights-body'
      >
        <Styled.HighlightsToolbar>
          <Filters />
          <Styled.HiglightsPrintButton />
        </Styled.HighlightsToolbar>
        <Highlights />
        {this.state.showGoToTop && (
          <Styled.GoToTopWrapper
            onClick={this.scrollToTop}
            data-testid='back-to-top-highlights'
          >
            <Styled.GoToTop>
              <Styled.GoToTopIcon />
            </Styled.GoToTop>
          </Styled.GoToTopWrapper>
        )}
      </Styled.ShowMyHighlightsBody>
    );
  }
}

export default ShowMyHighlights;
