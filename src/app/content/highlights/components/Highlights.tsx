import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import Loader from '../../../components/Loader';
import { stripHtmlAndTrim } from '../../hooks/receiveContent';
import { book as bookSelector } from '../../selectors';
import { ArchiveTree, ArchiveTreeSection } from '../../types';
import { stripIdVersion } from '../../utils/idUtils';
import { summaryHighlights, summaryIsLoading } from '../selectors';
import { SummaryHighlights } from '../types';
import * as HStyled from './HighlightStyles';
import * as Styled from './ShowMyHighlightsStyles';

// tslint:disable-next-line: variable-name
const Highlights = () => {
  const book = useSelector(bookSelector);
  const highlights = useSelector(summaryHighlights);
  const isLoading = useSelector(summaryIsLoading);

  if (book && Object.keys(highlights).length > 0) {
    return <Styled.Highlights isLoading={isLoading}>
      {isLoading ? <Styled.LoaderWrapper><Loader/></Styled.LoaderWrapper> : null}
      {highlights[book.tree.id]
        && <SectionHighlights
          section={book.tree}
          highlights={highlights}
        />}
      {book.tree.contents.map((chapter) => (
        highlights[chapter.id]
          && <SectionHighlights
            key={chapter.id}
            section={chapter}
            highlights={highlights}
          />
      ))}
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
  section: ArchiveTreeSection;
  highlights: SummaryHighlights;
}

// tslint:disable-next-line: variable-name
const SectionHighlights = ({ section, highlights }: SectionHighlightsProps) => (
  <>
    <Styled.HighlightsChapter>
      {stripHtmlAndTrim(section.title)}
    </Styled.HighlightsChapter>
    <Styled.HighlightWrapper>
    {(section as ArchiveTree).contents.map((page) => {
      const pageId = stripIdVersion(page.id);
      if (!highlights[section.id][pageId]) { return null; }
      return <div key={page.id}>
        <Styled.HighlightSection>
          {stripHtmlAndTrim(page.title)}
        </Styled.HighlightSection>
        {highlights[section.id][pageId].map((item) => {
          return (
            <Styled.HighlightOuterWrapper key={item.id}>
              <Styled.HighlightContentWrapper color={item.color}>
                <Styled.HighlightContent
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
      </div>;
    })}
    </Styled.HighlightWrapper>
  </>
);
