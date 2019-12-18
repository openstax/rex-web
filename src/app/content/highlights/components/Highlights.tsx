import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import Loader from '../../../components/Loader';
import { bookSections } from '../../selectors';
import { LinkedArchiveTreeNode } from '../../types';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { summaryHighlights, summaryIsLoading } from '../selectors';
import { SummaryHighlights } from '../types';
import * as HStyled from './HighlightStyles';
import * as Styled from './ShowMyHighlightsStyles';

// tslint:disable-next-line: variable-name
const Highlights = () => {
  const sections = useSelector(bookSections);
  const highlights = useSelector(summaryHighlights);
  const isLoading = useSelector(summaryIsLoading);

  if (sections.size > 0 && Object.keys(highlights).length > 0) {
    return <Styled.Highlights isLoading={isLoading}>
      {isLoading ? <Styled.LoaderWrapper><Loader/></Styled.LoaderWrapper> : null}
      {Array.from(sections).map(([id, section]) => {
        if (!highlights[id]) { return null; }
        return <SectionHighlights
          key={id}
          section={section}
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
  section: LinkedArchiveTreeNode;
  highlights: SummaryHighlights;
}

// tslint:disable-next-line: variable-name
const SectionHighlights = ({ section, highlights }: SectionHighlightsProps) => {
  const pageIdIsSameAsSectionId = highlights[section.id][section.id];
  return (
    <React.Fragment>
      {!pageIdIsSameAsSectionId && <Styled.HighlightsChapter
        dangerouslySetInnerHTML={{ __html: section.title }}
      />}
      <Styled.HighlightWrapper>
      {Object.entries(highlights[section.id]).map(([pageId, pageHighlights]) => {
        pageId = stripIdVersion(pageId);
        const page = archiveTreeSectionIsChapter(section)
          ? findArchiveTreeNode(section, pageId)!
          : section;
        return <div key={pageId}>
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
        </div>;
      })}
      </Styled.HighlightWrapper>
    </React.Fragment>
  )
};
