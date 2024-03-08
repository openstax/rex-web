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
  padding-top: 1.6rem;
  ${textStyle}
  color: ${theme.color.text.label};
  font-size: 1.4rem;
  font-family: inherit;
  line-height: 2rem;
  font-weight: normal;

  :placeholder-shown {
    padding-top: 1rem;
  }
`;

// tslint:disable-next-line:variable-name
const WrapperLabel = styled.label`
  position: relative;

  textarea:placeholder-shown ~ div {
    color: ${theme.color.text.label};
    font-size: 1.4rem;
    top: 1.3rem;

    ::after {
      content: '...';
    }
  }
`;

// tslint:disable-next-line:variable-name
const FloatingLabel = styled.div`
  color: ${theme.color.primary.blue.base};
  font-size: 1.2rem;
  position: absolute;
  left: 0.9rem;
  top: 0.5rem;
  transition: all 0.3s;
`;


// tslint:disable-next-line:variable-name
const Note = ({onChange, onFocus, note, textareaRef}: Props) => {
  const setTextAreaHeight = React.useCallback(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    if (element.scrollHeight > element.offsetHeight) {
      element.style.height = `${element.scrollHeight + 5}px`;
    }
  }, [textareaRef]);

  React.useEffect(setTextAreaHeight, [note, setTextAreaHeight]);

  return (
    <WrapperLabel for='note-textarea'>
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
      />
      <FloatingLabel>{useIntl().formatMessage({id: 'i18n:highlighting:card:placeholder'})}</FloatingLabel>
    </WrapperLabel>
  );
};

export default Note;
