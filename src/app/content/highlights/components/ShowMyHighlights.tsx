import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../../types';
import * as selectors from '../selectors';
import { HighlightData } from '../types';
import * as Styled from './HighlightStyles';

interface Props {
  highlights: HighlightData[];
}

class ShowMyHighlights extends Component<Props> {
  public render() {
    return (<Styled.ShowMyHighlightsBody>
        <Styled.HighlightsChapter>2. Kinematics</Styled.HighlightsChapter>
        <Styled.HighlightWrapper>
          <Styled.HighlightSection>2.1 Displacement</Styled.HighlightSection>
          { this.props.highlights.map((item) => {
            return <Styled.HighlightOuterWrapper>
              <Styled.HighlightContentWrapper className={'highlight ' + item.style }>
                <Styled.HighlightContent
                  key={item.id}
                  dangerouslySetInnerHTML={{__html: item.content}}
                />
                { item.note ? <Styled.HighlightNote><p>Note:</p> {item.note}</Styled.HighlightNote> : null }
              </Styled.HighlightContentWrapper>
            </Styled.HighlightOuterWrapper>; })
          }
        </Styled.HighlightWrapper>
      </Styled.ShowMyHighlightsBody>
    );
  }

  public componentDidMount() {
    console.log(this.props.highlights);
  }
}

export default connect(
  (state: AppState) => ({
    highlights: selectors.highlights(state),
  })
)(ShowMyHighlights);
