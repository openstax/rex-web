import React from 'react';

type FunctionWithProperty = {
  (title: string): void;
  fn?: (title: string) => void;
}

const announcePageTitle: FunctionWithProperty = (title: string) => {
  if (announcePageTitle?.fn) {
    announcePageTitle.fn(title);
  }
}

export default announcePageTitle;

export function PageTitleConfirmation({ className }: { className: string }) {
  const [docTitle, setDocTitle] = React.useState('');

  announcePageTitle.fn = setDocTitle;

  return (
    <div
      id='page-title-confirmation'
      className={className}
      aria-live='polite'
    >
      {`Loaded page "${docTitle}"`}
    </div>
  );
}
