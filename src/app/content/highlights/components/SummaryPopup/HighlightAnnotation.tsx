import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import Button from '../../../../components/Button';
import { textRegularStyle } from '../../../../components/Typography';
import { useServices } from '../../../../context/Services';
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
  const intl = useIntl();

  React.useEffect(() => {
    setAnno(annotation);
  }, [annotation]);

  if (anno.length === 0 && !isEditing) { return null; }

  return <HighlightNote>
    {isEditing
      ? <Textarea
        value={anno}
        placeholder={intl.formatMessage({id: 'i18n:highlighting:card:placeholder'})}
        autoFocus={true}
        aria-label={intl.formatMessage({id: 'i18n:highlighting:card:aria-label'})}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setAnno(e.target.value);
        }}
      />
      : <React.Fragment>
        <span className='highlight-note-text'>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
            {(msg) => msg}
          </FormattedMessage>
        </span>
        <HighlightNoteAnnotation>
          {annotation}
        </HighlightNoteAnnotation>
      </React.Fragment>
    }
    {isEditing && <HighlightEditButtons>
      <Button
        data-testid='save'
        data-analytics-label='save'
        size='medium'
        variant='primary'
        aria-label={intl.formatMessage({id: 'i18n:highlighting:button:save'})}
        onClick={() => onSave(anno)}
      >{intl.formatMessage({id: 'i18n:highlighting:button:save'})}</Button>
      <Button
        size='medium'
        data-analytics-label='cancel'
        data-testid='cancel'
        aria-label={intl.formatMessage({id: 'i18n:highlighting:button:cancel'})}
        onClick={() => {
          onCancel();
          setAnno(annotation);
        }}
      >{intl.formatMessage({id: 'i18n:highlighting:button:cancel'})}</Button>
    </HighlightEditButtons>}
  </HighlightNote>;
};

export default HighlightAnnotation;
