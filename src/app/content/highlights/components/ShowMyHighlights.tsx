import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import OnScroll from '../../../components/OnScroll';
import { isHtmlElement } from '../../../guards';
import { AppState } from '../../../types';
import * as selectors from '../selectors';
import { HighlightData } from '../types';
import * as Styled from './ShowMyHighlightsStyles';

interface Props {
  highlights: HighlightData[];
}

class ShowMyHighlights extends Component<Props, {scrollTransition: boolean}> {
  public myHighlightsBodyRef = React.createRef<HTMLElement>();

  public state = { scrollTransition: false };

  private scrollHandler: (() => void) | undefined;

  public scrollTop = () => {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (!highlightsBodyRef) {
      return;
    }

    highlightsBodyRef.scrollTop = 0;

  };

  public showGoToTop = (bodyElement: HTMLElement) => () => {
    if ( bodyElement.scrollTop > 0) {
      this.setState({scrollTransition: true});
    } else {
      this.setState({scrollTransition: false});
    }
  };

  public componentDidMount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (isHtmlElement(highlightsBodyRef)) {
      this.scrollHandler = this.showGoToTop(highlightsBodyRef);
      highlightsBodyRef.addEventListener('scroll', this.scrollHandler);
    }
  }

  public componentWillUnmount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (this.scrollHandler && isHtmlElement(highlightsBodyRef)) {
      highlightsBodyRef.removeEventListener('scroll', this.scrollHandler);
    }
  }

  public render() {
    return (<Styled.ShowMyHighlightsBody ref={this.myHighlightsBodyRef} data-testid='show-myhighlights-body'>
      <OnScroll callback={this.scrollHandler}/>
        <Styled.HighlightsChapter>2. Kinematics</Styled.HighlightsChapter>
        <Styled.HighlightWrapper>
          <Styled.HighlightSection>2.1 Displacement</Styled.HighlightSection>
          { this.props.highlights.map((item) => {
            return <Styled.HighlightOuterWrapper key={item.id}>
              <Styled.HighlightContentWrapper color={item.style}>
                <Styled.HighlightContent
                  dangerouslySetInnerHTML={{__html: item.content}}
                />
                { item.note ? <Styled.HighlightNote><span>Note:</span> {item.note}</Styled.HighlightNote> : null }
              </Styled.HighlightContentWrapper>
            </Styled.HighlightOuterWrapper>; })
          }
        </Styled.HighlightWrapper>
          { this.state.scrollTransition &&
            <Styled.GoToTopWrapper onClick={this.scrollTop} data-testid='back-to-top-highlights'>
          <Styled.GoToTop><Styled.GoToTopIcon/></Styled.GoToTop>
        </Styled.GoToTopWrapper> }
      </Styled.ShowMyHighlightsBody>
    );
  }
}

export default connect(
  (state: AppState) => ({
    highlights: selectors.highlights(state),
  })
)(ShowMyHighlights);
