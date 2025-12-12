import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { KeyboardEvent } from '@openstax/types/lib.dom';
import { cardPadding, cardWidth } from '../constants';

interface Props {
  note: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (note: string) => void;
  onFocus: () => void;
  edit?: boolean;
}

const noteMaxLength = 1000;

const width = cardWidth - cardPadding * 2;
// tslint:disable-next-line:variable-name
const TextArea = styled.textarea`
  display: block;
  min-height: 5.6rem;
  width: ${width}rem;
  max-height: 30rem;
  max-width: ${width}rem;
  min-width: ${width}rem;
  border: 1px solid ${theme.color.neutral.formBorder};
  padding: ${cardPadding}rem;
  padding-top: 0.2rem;
  ${textStyle}
  color: ${theme.color.text.label};
  font-size: 1.4rem;
  font-family: inherit;
  line-height: 2rem;
  font-weight: normal;

  :empty {
    padding-top: 1rem;
  }
`;

// tslint:disable-next-line:variable-name
const SimpleLabel = styled.label`
  color: ${theme.color.primary.blue.base};
  font-size: 1.2rem;
  padding-left: 0.2rem;
`;

// exported for test coverage reasons
export function escapeHandler(onElement: HTMLTextAreaElement | null, shouldDo: boolean) {
  if (shouldDo) {
    onElement?.dispatchEvent(new CustomEvent('hideCardEvent', {bubbles: true}));
  }
}

// tslint:disable-next-line:variable-name
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
  const escCb = React.useCallback((ev: KeyboardEvent) => {
    const shouldDo = ev.key === 'Escape' && textareaRef.current?.textContent === '';

    escapeHandler(textareaRef.current, shouldDo);
  }, [textareaRef]);

  return (
    <>
      <SimpleLabel htmlFor='note-textarea'>{useIntl().formatMessage({id: labelId})}</SimpleLabel>
      <TextArea
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
      />
    </>
  );
};

export default Note;
