import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { typesetMath } from '../../../../helpers/mathjax';
import { isHtmlElement } from '../../../guards';
import { AppState } from '../../../types';
import { assertWindow } from '../../../utils';
import * as selectors from '../selectors';
import { HighlightData } from '../types';
import * as Styled from './ShowMyHighlightsStyles';
import Filters from './SummaryPopup/Filters';

interface Props {
  highlights: HighlightData[];
}

class ShowMyHighlights extends Component<Props, { showGoToTop: boolean }> {
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
        <Filters />
        <Styled.HighlightsChapter>2. Kinematics</Styled.HighlightsChapter>
        <Styled.HighlightWrapper>
          <Styled.HighlightSection>2.1 Displacement</Styled.HighlightSection>
          {this.props.highlights.map((item) => {
            return (
              <Styled.HighlightOuterWrapper key={item.id}>
                <Styled.HighlightContentWrapper color={item.color}>
                  <Styled.HighlightContent className='summary-highlight-content'
                    dangerouslySetInnerHTML={{ __html: item.highlightedContent }}
                  />
                  {item.annotation ? (
                    <Styled.HighlightNote>
                      <span>Note:</span> {item.annotation}
                    </Styled.HighlightNote>
                  ) : null}
                </Styled.HighlightContentWrapper>
              </Styled.HighlightOuterWrapper>
            );
          })}
        </Styled.HighlightWrapper>
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

export default connect((state: AppState) => ({
  highlights: selectors.highlights(state),
}))(ShowMyHighlights);
