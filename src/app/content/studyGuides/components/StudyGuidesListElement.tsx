import { Highlight } from '@openstax/highlighter/dist/api';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import ContentExcerpt, { HighlightContent } from '../../../components/ContentExcerpt';
import { textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { highlightStyles } from '../../constants';
import { popupPadding } from '../../styles/PopupStyles';
import addTargetBlankToLinks from '../../utils/addTargetBlankToLinks';

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

    ${HighlightContent} {
      background-color: white;
    }
  }
`;

interface HighlightListElementProps {
  highlight: Highlight;
}

// tslint:disable-next-line:variable-name
const HighlightListElement = ({ highlight }: HighlightListElementProps) => {
  const content = React.useMemo(
    () => addTargetBlankToLinks(highlight.highlightedContent),
    [highlight.highlightedContent]);

  return <HighlightOuterWrapper>
    <HighlightAnnotation>
      {highlight.annotation}
    </HighlightAnnotation>
    <HighlightContentWrapper color={highlight.color}>
      <ContentExcerpt
        className='summary-highlight-content'
        highlight={highlight}
        content={content}
      />
    </HighlightContentWrapper>
  </HighlightOuterWrapper>;
};

export default HighlightListElement;
