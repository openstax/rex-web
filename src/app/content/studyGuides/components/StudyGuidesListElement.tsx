import { Highlight } from '@openstax/highlighter/dist/api';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import { textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import ContentExcerpt from '../../components/ContentExcerpt';
import { highlightStyles } from '../../constants';
import { popupPadding } from '../../styles/PopupStyles';

// tslint:disable-next-line:variable-name
const HighlightOuterWrapper = styled.div`
  overflow: visible;
  padding: 0 ${popupPadding}rem 1rem ${popupPadding}rem;

  :not(:last-child) {
    border-bottom: solid 0.2rem ${theme.color.neutral.darker};
  }

  @media print {
    page-break-inside: avoid;

    :not(:last-child) {
      border-color: white;
    }
  }

  background: ${theme.color.neutral.base};
  ${theme.breakpoints.mobile`
    padding: 0 0 1rem 0;
  `}
`;

// tslint:disable-next-line:variable-name
const HighlightAnnotation = styled.div`
  ${textRegularStyle}
  display: flex;
  padding: 1.2rem 0;
  color: ${theme.color.text.black};
  white-space: pre-wrap;
  word-break: break-word;
  ${theme.breakpoints.mobile`
    padding: 1rem;
  `}
`;

// tslint:disable-next-line:variable-name
export const HighlightContentWrapper = styled.div`
  padding-left: 0.4rem;
  ${(props: {color: string}) => {
    const style = highlightStyles.find((search) => search.label === props.color);

    if (!style) {
      return null;
    }

    return css`
      border-left: solid 0.8rem ${style.passive};
      margin-left: 2.1rem;
    `;
  }}

  ${theme.breakpoints.mobile`
    margin-left: 2rem;
  `}

  @media print {
    break-inside: avoid-page;

    ${ContentExcerpt} {
      background-color: white;
    }
  }
`;

interface HighlightListElementProps {
  highlight: Highlight;
}

// tslint:disable-next-line:variable-name
const HighlightListElement = ({ highlight }: HighlightListElementProps) =>
  <HighlightOuterWrapper>
    <HighlightAnnotation>
      {highlight.annotation}
    </HighlightAnnotation>
    <HighlightContentWrapper color={highlight.color}>
      <ContentExcerpt
        data-highlight-id={highlight.id}
        content={highlight.highlightedContent}
        source={highlight.sourceId}
      />
    </HighlightContentWrapper>
  </HighlightOuterWrapper>;

export default HighlightListElement;
