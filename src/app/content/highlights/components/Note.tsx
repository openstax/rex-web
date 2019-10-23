import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled from 'styled-components';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { cardPadding, cardWidth } from '../constants';

interface Props {
  highlight: Highlight;
}

// tslint:disable-next-line:variable-name
const TextArea = styled.textarea`
  min-height: 5.6rem;
  width: ${cardWidth - cardPadding * 2}rem;
  border: 1px solid ${theme.color.neutral.formBorder};
  padding: ${cardPadding}rem;
  ${textStyle}
  color: ${theme.color.text.label};
  font-size: 1.4rem;
  line-height: 2rem;
  font-weight: normal;
`;

// tslint:disable-next-line:variable-name
const Note = (_props: Props) => {
  const textArea = React.useRef<HTMLElement>(null);

  return <TextArea
    ref={textArea}
    onChange={() => {
      const element = textArea.current;
      if (element && element.scrollHeight > element.offsetHeight) {
        element.style.height = `${element.scrollHeight + 5}px`;
      }
    }}
    placeholder='Add a note...'
  />;
};

export default Note;
