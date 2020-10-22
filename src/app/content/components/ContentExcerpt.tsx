import React from 'react';
import styled from 'styled-components/macro';
import { bodyCopyRegularStyle } from '../../components/Typography';
import addTargetBlankToLinks from '../utils/addTargetBlankToLinks';

interface Props {
  content: string;
  className: string;
}

// tslint:disable-next-line:variable-name
const ContentExcerpt = styled((props: Props) => {
  const {
    content,
    className,
    ...excerptProps
  } = props;

  const fixedContent = React.useMemo(
    () => addTargetBlankToLinks(props.content),
    [props.content]
  );

  return <div
    dangerouslySetInnerHTML={{ __html: fixedContent }}
    className={`content-excerpt ${className}`}
    {...excerptProps}
  />;
})`
  ${bodyCopyRegularStyle}
  overflow: auto;

  * {
    overflow: initial;
  }
`;

export default ContentExcerpt;
