import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
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

  textarea {
    ${textRegularStyle}
    flex: 1;
    letter-spacing: 0;
    line-height: 20px;
    color: ${theme.color.text.label};
    padding: 8px;
  }
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

  return <HighlightNote>
    {isEditing
      ? <FormattedMessage id='i18n:highlighting:card:placeholder'>
        {(msg: string) => <textarea
          value={anno}
          placeholder={msg}
          autoFocus={true}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setAnno(e.target.value);
          }}
        />}
      </FormattedMessage>
      : <HighlightNote>
        <span className='highlight-note-text'>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </span>
        {annotation}
      </HighlightNote>
      }
    {isEditing && <HighlightEditButtons>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          data-analytics-label='save'
          size='medium'
          variant='primary'
          onClick={() => onSave(anno)}
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg: Element | string) => <Button
          size='medium'
          data-analytics-label='cancel'
          data-testid='cancel'
          onClick={onCancel}
        >{msg}</Button>}
      </FormattedMessage>
    </HighlightEditButtons>}
  </HighlightNote>;
};

export default HighlightAnnotation;
