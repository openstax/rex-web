import React from 'react';
import { Element, EventListener } from '@openstax/types/lib.dom';

export default function announcePageTitle(title: string) {
  const el = document?.getElementById('page-title-confirmation');

  el?.dispatchEvent(
    new CustomEvent('page-title', {
      detail: title,
    })
  );
}

export function PageTitleConfirmation({ className }: { className: string }) {
  const [docTitle, setDocTitle] = React.useState('');
  const ref = React.useRef<Element | null>(null);

  React.useEffect(() => {
    const el = ref.current;

    if (!el) { return; }
    const listener = ((e: CustomEvent) => {
      setDocTitle(e.detail);
    }) as EventListener;

    el.addEventListener('page-title', listener);
    return () => el.removeEventListener('page-title', listener);
  }, []);

  return (
    <div
      id='page-title-confirmation'
      className={className}
      ref={ref}
      aria-live='polite'
    >
      {`Loaded page "${docTitle}"`}
    </div>
  );
}
