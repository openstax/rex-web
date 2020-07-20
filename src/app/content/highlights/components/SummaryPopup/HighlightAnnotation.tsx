import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button from '../../../../components/Button';
import { textRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { HighlightEditButtons } from './styles';

// tslint:disable-next-line:variable-name
const HighlightNote = styled.div`
  ${textRegularStyle}
  padding-top: 1.2rem;
  display: flex;

  span {
    margin: 0 0.8rem 0 0;
    overflow: visible;
  }
`;

// tslint:disable-next-line:variable-name
const HighlightNoteAnnotation = styled.div`
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
`;

// tslint:disable-next-line:variable-name
const Textarea = styled.textarea`
  ${textRegularStyle}
  font-family: inherit;
  flex: 1;
  letter-spacing: 0;
  line-height: 20px;
  color: ${theme.color.text.label};
  padding: 8px;
`;

interface HighlightAnnotationProps {
  annotation: string;
  isEditing: boolean;
  onSave: (annotation: string) => void;
  onCancel: () => void;
}

// tslint:disable-next-line:variable-name
const HighlightAnnotation = (
  { annotation, isEditing, onSave, onCancel }: HighlightAnnotationProps
) => {
  const [anno, setAnno] = React.useState(annotation);

  if (anno.length === 0 && !isEditing) { return null; }

  return <HighlightNote>
    {isEditing
      ? <FormattedMessage id='i18n:highlighting:card:aria-label'>
        {(ariaMsg: string) => <FormattedMessage id='i18n:highlighting:card:placeholder'>
          {(msg: string) => <Textarea
            value={anno}
            placeholder={msg}
            autoFocus={true}
            aria-label={ariaMsg}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setAnno(e.target.value);
            }}
          />}
        </FormattedMessage>}
      </FormattedMessage>
      : <React.Fragment>
        <span className='highlight-note-text'>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </span>
        <HighlightNoteAnnotation>
          {annotation}
        </HighlightNoteAnnotation>
      </React.Fragment>
    }
    {isEditing && <HighlightEditButtons>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          data-analytics-label='save'
          size='medium'
          variant='primary'
          aria-label={msg}
          onClick={() => onSave(anno)}
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg: Element | string) => <Button
          size='medium'
          data-analytics-label='cancel'
          data-testid='cancel'
          aria-label={msg}
          onClick={() => {
            onCancel(); 
            setAnno(annotation);
          }}
        >{msg}</Button>}
      </FormattedMessage>
    </HighlightEditButtons>}
  </HighlightNote>;
};

export default HighlightAnnotation;
