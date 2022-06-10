import { HTMLDivElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled from 'styled-components/macro';
import { MAIN_CONTENT_ID } from '../context/constants';
import { Consumer } from '../context/SkipToContent';
import { mergeRefs } from '../utils';
import DynamicContentStyles from './DynamicContentStyles';

interface Props {
  className?: string;
  dangerouslySetInnerHTML?: { __html: string; };
}

// tslint:disable-next-line:variable-name
const ContentStyles = styled(DynamicContentStyles)`
  outline: none;
  &[data-text-size="-2"] { --content-text-scale: .75;  }
  &[data-text-size="-1"] { --content-text-scale: .9;   }
  &[data-text-size="1"]  { --content-text-scale: 1.25; }
  &[data-text-size="2"]  { --content-text-scale: 1.5;  }
  &[data-text-size="3"]  { --content-text-scale: 2;    }
`;

// tslint:disable-next-line:variable-name
const MainContent = React.forwardRef<HTMLDivElement, React.PropsWithChildren<Props>>(
  ({children, className, ...props}, ref) => <Consumer>
    {({registerMainContent}) => <div
      ref={mergeRefs(ref, registerMainContent)}
      className={className}
      tabIndex={0}
    >
      <ContentStyles
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        {...props}
      >
        {children}
      </ContentStyles>
    </div>}
  </Consumer>
);

export default MainContent;
