import { HTMLElement } from '@openstax/types/lib.dom';
import React, { Ref } from 'react';
import { Consumer, MAIN_CONTENT_ID } from '../context/SkipToContent';
import { mergeRefs } from '../utils';

interface Props {
  className?: string;
  dangerouslySetInnerHTML?: { __html: string; };
}

// tslint:disable-next-line:variable-name
const MainContent = React.forwardRef<Ref<HTMLElement>, Props>(({children, ...props}, ref) => <Consumer>
  {({registerMainContent}) => <div
    id={MAIN_CONTENT_ID}
    ref={mergeRefs(ref, registerMainContent)}
    tabIndex={-1}
    {...props}
  >
    {children}
  </div>}
</Consumer>);

export default MainContent;
