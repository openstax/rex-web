import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import ContentExcerpt from '../../../components/ContentExcerpt';
import { highlightStyles } from '../../../constants';
import { book as bookSelector } from '../../../selectors';
import { requestDeleteHighlight, updateHighlight } from '../../actions';
import { HighlightData } from '../../types';
import ContextMenu from './ContextMenu';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';
import { useCreateHighlightLink } from './utils';
import { useConfirmationToastContext } from '../../../components/ConfirmationToast';
import classNames from 'classnames';
import './HighlightListElement.css';

export const HighlightOuterWrapper = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('highlight-outer-wrapper', className)} />
);

export const HighlightContentWrapper = (
  { color, className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> &
  { color: string; theme?: unknown }
) => {
  const style = highlightStyles.find((search) => search.label === color);

  const cssVariables = style ? {
    '--highlight-focused-color': style.focused,
    '--highlight-passive-color': style.passive,
  } as React.CSSProperties : undefined;

  return (
    <div
      {...props}
      className={classNames('highlight-content-wrapper', className)}
      style={{ ...cssVariables, ...props.style }}
    />
  );
};

export const HiddenLabel = (
  { className, theme: _theme, ...props }: React.HTMLAttributes<HTMLDivElement> & { theme?: unknown }
) => (
  <div {...props} className={classNames('hidden-label', className)} />
);

function HighlightContentLabel({ color }: { color: string }) {
  const assertedColor = ['blue', 'green', 'pink', 'purple'].includes(color) ? color : 'yellow';
  return (
    <HiddenLabel>
      <FormattedMessage id="i18n:highlighter:display-note:label" />
      <FormattedMessage id={`i18n:highlighting:colors:${assertedColor}`} />
    </HiddenLabel>
  );
}

interface HighlightListElementProps {
  highlight: HighlightData;
  locationFilterId: string;
  pageId: string;
}

const HighlightListElement = ({ highlight, locationFilterId, pageId }: HighlightListElementProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const book = useSelector(bookSelector);
  const dispatch = useDispatch();
  const linkToHighlight = useCreateHighlightLink(highlight, book);

  const trackEditNoteColor = useAnalyticsEvent('editNoteColor');
  const trackEditAnnotation = useAnalyticsEvent('editAnnotation');
  const trackDeleteHighlight = useAnalyticsEvent('deleteHighlight');
  const showToast = useConfirmationToastContext();
  const intl = useIntl();

  const updateAnnotation = React.useCallback(
    (annotation: string) => {
      const addedNote = highlight.annotation === undefined;

      if (annotation === '' && !addedNote && confirming === false) {
        setConfirming(true);
        return;
      }
      dispatch(
        updateHighlight(
          {
            highlight: { annotation },
            id: highlight.id,
          },
          {
            locationFilterId,
            pageId,
            preUpdateData: {
              highlight: {
                annotation: highlight.annotation,
                color: highlight.color as string as HighlightUpdateColorEnum,
              },
              id: highlight.id,
            },
          }
        )
      );
      trackEditAnnotation(addedNote, highlight.color, true);
      setIsEditing(false);
      const removedNote = annotation === '' && !addedNote;
      setConfirming(false);
      showToast({
        message: intl.formatMessage({
          id: removedNote ? 'i18n:highlighting:toast:note-delete' : 'i18n:highlighting:toast:save-success',
        }),
      });
    },
    [dispatch, highlight, locationFilterId, pageId, trackEditAnnotation, confirming, showToast, intl]
  );

  const updateColor = (color: HighlightColorEnum) => {
    dispatch(
      updateHighlight(
        {
          highlight: { color: color as string as HighlightUpdateColorEnum },
          id: highlight.id,
        },
        {
          locationFilterId,
          pageId,
          preUpdateData: {
            highlight: {
              annotation: highlight.annotation,
              color: highlight.color as string as HighlightUpdateColorEnum,
            },
            id: highlight.id,
          },
        }
      )
    );
    trackEditNoteColor(color, true);
  };

  const confirmDelete = () => {
    dispatch(
      requestDeleteHighlight(highlight, {
        locationFilterId,
        pageId,
      })
    );
    trackDeleteHighlight(highlight.color, true);
    showToast({
      message: intl.formatMessage({ id: 'i18n:highlighting:toast:highlight-delete' }),
    });
  };

  return (
    <HighlightOuterWrapper>
      {!isEditing && !isDeleting && (
        <ContextMenu
          highlight={highlight}
          linkToHighlight={linkToHighlight}
          onDelete={() => setIsDeleting(true)}
          onEdit={() => setIsEditing(true)}
          onColorChange={updateColor}
        />
      )}
      <HighlightContentWrapper color={highlight.color}>
        <HighlightContentLabel color={highlight.color} />
        <ContentExcerpt
          data-highlight-id={highlight.id}
          content={highlight.highlightedContent}
          source={highlight.sourceId}
        />
        <HighlightAnnotation
          annotation={highlight.annotation || ''}
          isEditing={isEditing}
          onSave={updateAnnotation}
          onCancel={() => setIsEditing(false)}
        />
        {confirming === true && (
          <HighlightDeleteWrapper
            deletingWhat="note"
            onCancel={() => {
              setConfirming(false);
              setIsEditing(false);
            }}
            onDelete={() => updateAnnotation('')}
          />
        )}
      </HighlightContentWrapper>
      {isDeleting && (
        <HighlightDeleteWrapper
          deletingWhat={highlight.annotation ? 'both' : 'highlight'}
          onCancel={() => setIsDeleting(false)}
          onDelete={confirmDelete}
        />
      )}
    </HighlightOuterWrapper>
  );
};

export default HighlightListElement;
