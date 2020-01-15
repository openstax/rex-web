import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../components/Button';
import * as Styled from './ShowMyHighlightsStyles';

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

  return <Styled.HighlightNote>
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
      : <Styled.HighlightNote>
        <span>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </span>
        {annotation}
      </Styled.HighlightNote>
      }
    {isEditing && <Styled.HighlightEditButtons>
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
    </Styled.HighlightEditButtons>}
  </Styled.HighlightNote>;
};

export default HighlightAnnotation;
