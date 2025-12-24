import { HTMLDivElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled from 'styled-components/macro';
import { TextResizerValue, textResizerValueMap } from '../content/constants';
import { State } from '../content/types';
import { MAIN_CONTENT_ID } from '../context/constants';
import { Consumer } from '../context/SkipToContent';
import { mergeRefs } from '../utils';
import DynamicContentStyles from './DynamicContentStyles';

interface Props {
  book: State['book'];
  className?: string;
  dangerouslySetInnerHTML?: { __html: string; };
  textSize?: TextResizerValue;
}
const ContentStyles = styled(({ textSize, ...props }) => <DynamicContentStyles {...props} />)`
  outline: none;
  ${(props: {textSize: TextResizerValue}) => `
    --content-text-scale: ${textResizerValueMap.get(props.textSize)};
  `}

  /* Compensates for a Firefox issue */
  .os-problem-container .token,
  .os-solution-container .token {
    font-size-adjust: cap-height 1;
    vertical-align: middle;
  }
`;

const MainContent = React.forwardRef<HTMLDivElement, React.PropsWithChildren<Props>>(
  ({book, children, className, ...props}, ref) => <Consumer>
    {({registerMainContent}) => <main
      ref={mergeRefs(ref, registerMainContent)}
      className={className}
      tabIndex={-1}
    >
      <ContentStyles
        id={MAIN_CONTENT_ID}
        book={book}
        tabIndex={-1}
        {...props}
      >
        {children}
      </ContentStyles>
    </main>}
  </Consumer>
);

export default MainContent;
