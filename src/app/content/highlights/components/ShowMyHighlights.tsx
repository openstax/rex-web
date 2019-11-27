import React, { Component } from 'react';
import { connect } from 'react-redux';
import OnScroll, { OnScrollCallback } from '../../../components/OnScroll';
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

  public state = { scrollTransition: false};

  public scrollTop = () => {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (!window || !highlightsBodyRef) {
      return;
    }

    if (isHtmlElement(highlightsBodyRef)) {
      highlightsBodyRef.scroll({top: 0, left: 0, behavior: 'smooth' });
    }
  };

  public showGoToTop: OnScrollCallback = () => {
    console.log('works');
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (!window || !highlightsBodyRef) {
      return;
    }

    this.setState({scrollTransition: true});
    console.log(this.state.scrollTransition);
  };

  public render() {
    return (<OnScroll callback={this.showGoToTop}>
      <Styled.ShowMyHighlightsBody ref={this.myHighlightsBodyRef}>
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
        <Styled.GoToTopWrapper onClick={this.scrollTop}>
          <Styled.GoToTop><Styled.GoToTopIcon/></Styled.GoToTop>
        </Styled.GoToTopWrapper>
      </Styled.ShowMyHighlightsBody>
    </OnScroll>);
  }
}

export default connect(
  (state: AppState) => ({
    highlights: selectors.highlights(state),
  })
)(ShowMyHighlights);
