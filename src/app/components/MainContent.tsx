import { HTMLDivElement } from '@openstax/types/lib.dom';
import React from 'react';
import classNames from 'classnames';
import { TextResizerValue, textResizerValueMap, textResizerDefaultValue } from '../content/constants';
import { State } from '../content/types';
import { MAIN_CONTENT_ID } from '../context/constants';
import { Consumer } from '../context/SkipToContent';
import { mergeRefs } from '../utils';
import DynamicContentStyles from './DynamicContentStyles';
import './MainContent.css';

interface Props {
  book: State['book'];
  className?: string;
  dangerouslySetInnerHTML?: { __html: string; };
  style?: React.CSSProperties;
  textSize?: TextResizerValue;
}

interface ContentStylesProps extends Omit<Props, 'className'> {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  tabIndex?: number;
}

const ContentStyles = React.forwardRef<HTMLElement, React.PropsWithChildren<ContentStylesProps>>(
  ({ textSize=textResizerDefaultValue, className, style, children, ...props }, ref) => {
    const textScale = textResizerValueMap.get(textSize);

    return (
      <DynamicContentStyles
        {...props}
        ref={ref}
        className={classNames('main-content-styles', className)}
        style={{
          '--content-text-scale': textScale,
          ...style,
        } as React.CSSProperties}
      >
        {children}
      </DynamicContentStyles>
    );
  }
);

const MainContent = React.forwardRef<HTMLDivElement, React.PropsWithChildren<Props>>(
  ({ book, children, className, style, ...props }, ref) => (
    <Consumer>
      {({ registerMainContent }) => (
        <main ref={mergeRefs(ref, registerMainContent)} className={className} style={style} tabIndex={-1}>
          <ContentStyles id={MAIN_CONTENT_ID} book={book} tabIndex={-1} {...props}>
            {children}
          </ContentStyles>
        </main>
      )}
    </Consumer>
  )
);

export default MainContent;
