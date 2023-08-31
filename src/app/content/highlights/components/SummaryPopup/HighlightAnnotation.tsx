import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
  gap: 1rem;
  flex-flow: wrap;
  align-items: center;

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
  line-height: 2rem;
  min-height: 3.6rem;
  max-height: calc(60vh - 20rem);
  min-width: 60%;
  color: ${theme.color.text.label};
  padding: 0.8rem;
`;

interface HighlightAnnotationProps {
  annotation: string;
  isEditing: boolean;
  onSave: (annotation: string) => void;
  onCancel: () => void;
}

function DisplayHighlightAnnotation({
  annotation,
}: Pick<HighlightAnnotationProps, 'annotation'>) {
  return (
    <HighlightNote>
      <span className='highlight-note-text'>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
          {msg => msg}
        </FormattedMessage>
      </span>
      <HighlightNoteAnnotation>{annotation}</HighlightNoteAnnotation>
    </HighlightNote>
  );
}

const FUDGE_TO_AVOID_SCROLLBARS = 2;

function useCalculatedHeight() {
  const [taHeight, setTaHeight] = React.useState(0);
  const calculateHeight = React.useCallback(
    ({target}) => {
      const h = target.style.height;

      // Transient change to allow scrollHeight to shrink
      target.style.height = 0;
      setTaHeight(target.scrollHeight);
      target.style.height = h;
    },
    []
  );
  const taStyle = React.useMemo(
    () => (taHeight ? {
      height: `${taHeight + FUDGE_TO_AVOID_SCROLLBARS}px`
    }: null),
    [taHeight]
  );

  return {calculateHeight, taStyle};
}

// tslint:disable-next-line:variable-name
const EditHighlightAnnotation = ({
  annotation,
  onSave,
  onCancel,
}: Omit<HighlightAnnotationProps, 'isEditing'>) => {
  const [anno, setAnno] = React.useState(annotation);
  const intl = useIntl();
  const ref = React.useRef();
  const {calculateHeight, taStyle} = useCalculatedHeight();

  React.useEffect(() => {
    setAnno(annotation);
  }, [annotation]);

  React.useLayoutEffect(
    () => calculateHeight({target: ref.current}),
    [calculateHeight]
  );

  return (
    <HighlightNote>
      <Textarea
        value={anno}
        placeholder={intl.formatMessage({
          id: 'i18n:highlighting:card:placeholder',
        })}
        autoFocus={true}
        aria-label={intl.formatMessage({
          id: 'i18n:highlighting:card:aria-label',
        })}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
          setAnno(e.target.value);
        }}
        ref={ref}
        onInput={calculateHeight}
        style={taStyle}
      />
      <HighlightEditButtons>
        <Button
          data-testid='save'
          data-analytics-label='save'
          size='medium'
          variant='primary'
          aria-label={intl.formatMessage({
            id: 'i18n:highlighting:button:save',
          })}
          onClick={() => onSave(anno)}
        >
          {intl.formatMessage({ id: 'i18n:highlighting:button:save' })}
        </Button>
        <Button
          size='medium'
          data-analytics-label='cancel'
          data-testid='cancel'
          aria-label={intl.formatMessage({
            id: 'i18n:highlighting:button:cancel',
          })}
          onClick={() => {
            onCancel();
            setAnno(annotation);
          }}
        >
          {intl.formatMessage({ id: 'i18n:highlighting:button:cancel' })}
        </Button>
      </HighlightEditButtons>
    </HighlightNote>
  );
};

// tslint:disable-next-line:variable-name
const HighlightAnnotation = ({
  annotation,
  isEditing,
  onSave,
  onCancel,
}: HighlightAnnotationProps) => {
  if (isEditing) {
    return <EditHighlightAnnotation {...{ annotation, onSave, onCancel }} />;
  }

  return annotation.length > 0 ? (
    <DisplayHighlightAnnotation annotation={annotation} />
  ) : null;
};

export default HighlightAnnotation;
