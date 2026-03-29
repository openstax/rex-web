import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useIntl } from 'react-intl';
import theme from '../../../theme';
import { cardPadding, cardWidth } from '../constants';
import './Note.css';

interface Props {
  note: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (note: string) => void;
  onFocus: () => void;
  edit?: boolean;
}

const noteMaxLength = 1000;

// exported for test coverage reasons
export function escapeHandler(onElement: HTMLTextAreaElement | null, shouldDo: boolean) {
  if (shouldDo) {
    onElement?.dispatchEvent(new CustomEvent('hideCardEvent', {bubbles: true}));
  }
}

const Note = ({onChange, onFocus, note, textareaRef, edit = false}: Props) => {
  const setTextAreaHeight = React.useCallback(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    if (element.scrollHeight > element.offsetHeight) {
      element.style.height = `${element.scrollHeight + 5}px`;
    }
  }, [textareaRef]);
  const labelId = `i18n:highlighting:card:placeholder${edit ? '-edit' : ''}`;

  React.useEffect(setTextAreaHeight, [note, setTextAreaHeight]);
  const escCb = React.useCallback((ev: React.KeyboardEvent) => {
    const shouldDo = ev.key === 'Escape' && note === '';

    escapeHandler(textareaRef.current, shouldDo);
  }, [note, textareaRef]);

  // Calculate width from constants (for CSS variable)
  const textareaWidth = cardWidth - cardPadding * 2;

  return (
    <>
      <label
        htmlFor='note-textarea'
        className='note-label'
        style={{
          '--primary-blue': theme.color.primary.blue.base,
        } as React.CSSProperties}
      >
        {useIntl().formatMessage({id: labelId})}
      </label>
      <textarea
        id='note-textarea'
        ref={textareaRef}
        value={note}
        onFocus={onFocus}
        maxLength={noteMaxLength}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          onChange(e.target.value);
        }}
        placeholder=''
        onKeyDown={escCb}
        className='note-textarea'
        style={{
          '--note-textarea-width': `${textareaWidth}rem`,
          '--card-padding': `${cardPadding}rem`,
          '--form-border-color': theme.color.neutral.formBorder,
          '--note-text-color': theme.color.text.label,
        } as React.CSSProperties}
      />
    </>
  );
};

export default Note;
