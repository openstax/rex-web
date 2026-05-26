import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { HTMLTextAreaElement } from '@openstax/types/lib.dom';
import Button from '../../../../components/Button';
import theme from '../../../../theme';
import { HighlightEditButtons } from './styles';
import './HighlightAnnotation.css';

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
    <div className="highlight-note">
      <span className='highlight-note-text'>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
          {msg => msg}
        </FormattedMessage>
      </span>
      <div className="highlight-note-annotation">{annotation}</div>
    </div>
  );
}

type StyleableElement = Element & {
  style: { height?: number };
  scrollHeight: number;
};
const FUDGE_TO_AVOID_SCROLLBARS = 2;

function noScrollHeight(el: StyleableElement) {
  const h = el.style.height;

  // Transient change to allow scrollHeight to shrink
  el.style.height = 0;
  const result = el.scrollHeight;

  el.style.height = h;

  return result;
}

function useCalculatedHeight() {
  const [taHeight, setTaHeight] = React.useState(0);
  const calculateHeight = React.useCallback(({ target }) => {
    setTaHeight(noScrollHeight(target));
  }, []);
  const taStyle = React.useMemo(
    () => ({
      height: `${taHeight + FUDGE_TO_AVOID_SCROLLBARS}px`,
    }),
    [taHeight]
  );

  return { calculateHeight, taStyle };
}

const EditHighlightAnnotation = ({
  annotation,
  onSave,
  onCancel,
}: Omit<HighlightAnnotationProps, 'isEditing'>) => {
  const [anno, setAnno] = React.useState(annotation);
  const intl = useIntl();
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const { calculateHeight, taStyle } = useCalculatedHeight();

  React.useEffect(() => {
    setAnno(annotation);
  }, [annotation]);

  React.useEffect(() => {
    calculateHeight({ target: ref.current });
  }, [calculateHeight]);

  return (
    <div className="highlight-note">
      <label className="textarea-label">
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:text'>
          {msg => msg}
        </FormattedMessage>
        <textarea
          className="highlight-annotation-textarea"
          value={anno}
          placeholder={intl.formatMessage({
            id: 'i18n:highlighting:card:placeholder',
          })}
          autoFocus={true}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setAnno(e.target.value);
          }}
          ref={ref}
          onInput={calculateHeight}
          style={{
            ...taStyle,
            '--note-text-color': theme.color.text.label,
          } as React.CSSProperties}
        />
      </label>
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
    </div>
  );
};

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
