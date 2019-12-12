import React from 'react'
import * as Styled from './ShowMyHighlightsStyles'
import * as HStyled from './HighlightStyles'
import { useSelector } from 'react-redux';
import { summaryHighlights, summaryIsLoading } from '../selectors';
import { book as bookSelector } from '../../selectors';
import { flattenArchiveTree, nodeMatcher } from '../../utils/archiveTreeUtils';
import { stripHtmlAndTrim } from '../../hooks/receiveContent';
import Loader from '../../../components/Loader';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import { FormattedMessage } from 'react-intl';

const Highlights = () => {
  const book = useSelector(bookSelector);
  const flattenBook = book ? flattenArchiveTree(book.tree) : [];
  const highlights = useSelector(summaryHighlights);
  const isLoading = useSelector(summaryIsLoading);

  const findNodeInBook = (nodeId: string) => flattenBook.find(nodeMatcher(nodeId))

  const highlightsEntries = Object.entries(highlights)

  if (highlightsEntries.length > 0) {
    return <Styled.Highlights isLoading={isLoading}>
      {isLoading ? <Styled.LoaderWrapper><Loader/></Styled.LoaderWrapper> : null}
      {highlightsEntries.map(([chapterId, pages]) => {
        const chapter = findNodeInBook(chapterId)
        return <div key={chapterId}>
          <Styled.HighlightsChapter>
            {chapter ? stripHtmlAndTrim(chapter.title) : 'Undefined chapter'}
          </Styled.HighlightsChapter>
          <Styled.HighlightWrapper>
            {Object.entries(pages).map(([pageId, highlights]) => {
              const page = findNodeInBook(pageId);
              return <div key={pageId}>
                <Styled.HighlightSection>
                  {page ? stripHtmlAndTrim(page.title) : 'Undefined page'}
                </Styled.HighlightSection>
                {highlights.map((item) => {
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
              </div>
            })}
          </Styled.HighlightWrapper>
        </div>
      })}
    </Styled.Highlights>
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
  </Styled.Highlights>
}

export default Highlights;
