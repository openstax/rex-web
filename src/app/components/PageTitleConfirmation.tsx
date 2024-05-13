import React from 'react';
import { hiddenButAccessible } from '../theme';
import { AppState } from '../types';
import styled from 'styled-components';
import { connect } from 'react-redux';

function PageTitleConfirmation({
  className,
  title,
}: {
  className: string;
  title: string;
}) {
  const skipFirst = React.useRef(true);
  const message = React.useMemo(() => {
    if (!title) {
      return '';
    }
    if (skipFirst.current) {
      skipFirst.current = false;
      return '';
    }
    return `Loaded page ${title}`;
  }, [title]);

  return (
    <div id='page-title-confirmation' className={className} aria-live='polite'>
      {message}
    </div>
  );
}

export default connect(({ head: { title } }: AppState) => ({ title }))(styled(
  PageTitleConfirmation
)`
  ${hiddenButAccessible}
`);
