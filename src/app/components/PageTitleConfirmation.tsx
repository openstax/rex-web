import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { hiddenButAccessibleClass } from '../theme';
import { AppState } from '../types';
import { title as titleSelector } from '../head/selectors';

// Default export with Redux hooks - selects state internally
export default function PageTitleConfirmation({ className }: { className?: string }) {
  const title = useSelector((state: AppState) => titleSelector(state));

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
    <div
      id='page-title-confirmation'
      className={classNames(hiddenButAccessibleClass, className)}
      aria-live='polite'
    >
      {message}
    </div>
  );
}
