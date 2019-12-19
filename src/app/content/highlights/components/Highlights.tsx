import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import Loader from '../../../components/Loader';
import { LinkedArchiveTreeNode } from '../../types';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { highlightLocations, summaryHighlights, summaryIsLoading } from '../selectors';
import { SummaryHighlights } from '../types';
import * as HStyled from './HighlightStyles';
import * as Styled from './ShowMyHighlightsStyles';

// tslint:disable-next-line: variable-name
const Highlights = () => {
  const locations = useSelector(highlightLocations);
  const highlights = useSelector(summaryHighlights);
  const isLoading = useSelector(summaryIsLoading);

  if (locations.size > 0 && Object.keys(highlights).length > 0) {
    return <Styled.Highlights isLoading={isLoading}>
      {isLoading ? <Styled.LoaderWrapper><Loader/></Styled.LoaderWrapper> : null}
      {Array.from(locations).map(([id, location]) => {
        if (!highlights[id]) { return null; }
        return <SectionHighlights
          key={id}
          location={location}
          highlights={highlights}
        />;
      })}
    </Styled.Highlights>;
  }

  return <Styled.Highlights>
    <HStyled.GeneralLeftText>
      <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
      <span>
        <FormattedMessage
          id='i18n:toolbar:highlights:popup:heading:no-highlights-tip'
          defaultMessage='Try selecting different chapter or color filters to see different results.'
          values={{strong: (str: string) => <strong>{str}</strong>}}
        />
      </span>
    </HStyled.GeneralLeftText>
    <HStyled.MyHighlightsWrapper>
      <HStyled.GeneralText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:add-highlight'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </HStyled.GeneralText>
      <HStyled.GeneralTextWrapper>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:use-this-page'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </HStyled.GeneralTextWrapper>
      <HStyled.MyHighlightsImage src={myHighlightsEmptyImage} />
    </HStyled.MyHighlightsWrapper>
  </Styled.Highlights>;
};

export default Highlights;

interface SectionHighlightsProps {
  location: LinkedArchiveTreeNode;
  highlights: SummaryHighlights;
}

// tslint:disable-next-line: variable-name
const SectionHighlights = ({ location, highlights }: SectionHighlightsProps) => {
  const pageIdIsSameAsSectionId = highlights[location.id][location.id];
  return (
    <React.Fragment>
      {!pageIdIsSameAsSectionId && <Styled.HighlightsChapter
        dangerouslySetInnerHTML={{ __html: location.title }}
      />}
      {Object.entries(highlights[location.id]).map(([pageId, pageHighlights]) => {
        pageId = stripIdVersion(pageId);
        const page = archiveTreeSectionIsChapter(location)
          ? findArchiveTreeNode(location, pageId)!
          : location;
        return <Styled.HighlightWrapper key={pageId}>
          <Styled.HighlightSection dangerouslySetInnerHTML={{ __html: page.title }} />
          {pageHighlights.map((item) => {
            return (
              <Styled.HighlightOuterWrapper key={item.id}>
                <Styled.HighlightContentWrapper color={item.color}>
                  <Styled.HighlightContent
                    className='summary-highlight-content'
                    dangerouslySetInnerHTML={{ __html: item.highlightedContent }}
                  />
                  {item.annotation ? (
                    <Styled.HighlightNote>
                      <span>
                        <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
                          {(msg: Element | string) => msg}
                        </FormattedMessage>
                      </span>
                      {item.annotation}
                    </Styled.HighlightNote>
                  ) : null}
                </Styled.HighlightContentWrapper>
              </Styled.HighlightOuterWrapper>
            );
          })}
        </Styled.HighlightWrapper>;
      })}
    </React.Fragment>
  );
};
