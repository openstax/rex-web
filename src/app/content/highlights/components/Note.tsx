import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { cardPadding, cardWidth } from '../constants';

interface Props {
  note: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onChange: (note: string) => void;
  onFocus: () => void;
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
  ${textStyle}
  color: ${theme.color.text.label};
  font-size: 1.4rem;
  font-family: inherit;
  line-height: 2rem;
  font-weight: normal;
`;

// tslint:disable-next-line:variable-name
const Note = ({onChange, onFocus, note, textareaRef}: Props) => {
  const setTextAreaHeight = () => {
    const element = textareaRef.current;
    if (!element || !element) {
      return;
    }

    if (element.scrollHeight > element.offsetHeight) {
      element.style.height = `${element.scrollHeight + 5}px`;
    }
  };

  React.useEffect(setTextAreaHeight, [note]);

  return <TextArea
    ref={textareaRef}
    value={note}
    onFocus={onFocus}
    maxLength={noteMaxLength}
    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    }}
    placeholder={useIntl().formatMessage({id: 'i18n:highlighting:card:placeholder'})}
  />;
};

export default Note;
