import { HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import theme, { hiddenButAccessible } from '../../../../theme';
import ContentExcerpt from '../../../components/ContentExcerpt';
import { highlightStyles } from '../../../constants';
import { book as bookSelector } from '../../../selectors';
import { popupBodyPadding } from '../../../styles/PopupStyles';
import { requestDeleteHighlight, updateHighlight } from '../../actions';
import { HighlightData } from '../../types';
import ContextMenu from './ContextMenu';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';
import { useCreateHighlightLink } from './utils';
import { FormattedMessage } from 'react-intl';

// tslint:disable-next-line:variable-name
const HighlightOuterWrapper = styled.div`
  position: relative;
  overflow: visible;

  :not(:last-child) {
    border-bottom: solid 0.2rem ${theme.color.neutral.darker};
  }

  background: ${theme.color.neutral.base};

  @media print {
    border-width: 0;
    position: relative;
    page-break-inside: avoid;
    background: white;
  }
`;

// tslint:disable-next-line:variable-name
export const HighlightContentWrapper = styled.div`
  padding: 1.2rem ${popupBodyPadding}rem;
  ${(props: {color: string}) => {
    const style = highlightStyles.find((search) => search.label === props.color);

    if (!style) {
      return null;
    }

    return css`
      border-left: solid 0.8rem ${style.focused};

      ${ContentExcerpt} {
        background-color: ${style.passive};
      }

      .highlight-note-text {
        color: ${theme.color.neutral.foreground};
        font-weight: bold;
      }
    `;
  }}

  @media print {
    break-inside: avoid-page;

    ${ContentExcerpt} {
      background-color: white;
    }
  }
`;

interface HighlightListElementProps {
  highlight: HighlightData;
  locationFilterId: string;
  pageId: string;
}

// tslint:disable-next-line:variable-name
const HiddenLabel = styled.div`
  ${hiddenButAccessible}
`;

function HighlightContentLabel({color}: {color: string}) {
  const assertedColor = ['blue', 'green', 'pink', 'purple'].includes(color) ? color : 'yellow';
  return <HiddenLabel>
    <FormattedMessage id='i18n:highlighter:display-note:label' />
    <FormattedMessage id={`i18n:highlighting:colors:${assertedColor}`} />
  </HiddenLabel>;
}


// tslint:disable-next-line:variable-name
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

  const updateAnnotation = React.useCallback(
    (
      annotation: string
    ) => {
      const addedNote = (highlight.annotation === undefined);

      if (annotation === '' && !addedNote && confirming === false) {
        setConfirming(true);
        return;
      }
      dispatch(updateHighlight({
        highlight: {annotation},
        id: highlight.id,
      }, {
        locationFilterId,
        pageId,
        preUpdateData: {
          highlight: {
            annotation: highlight.annotation,
            color: highlight.color as string as HighlightUpdateColorEnum,
          },
          id: highlight.id,
        },
      }));
      trackEditAnnotation(addedNote, highlight.color, true);
      setIsEditing(false);
      setConfirming(false);
    },
    [dispatch, highlight, locationFilterId, pageId, trackEditAnnotation, confirming]
  );

  const updateColor = (color: HighlightColorEnum) => {
    dispatch(updateHighlight({
      highlight: {color: color as string as HighlightUpdateColorEnum},
      id: highlight.id,
    }, {
      locationFilterId,
      pageId,
      preUpdateData: {
        highlight: {
          annotation: highlight.annotation,
          color: highlight.color as string as HighlightUpdateColorEnum,
        },
        id: highlight.id,
      },
    }));
    trackEditNoteColor(color, true);
  };

  const confirmDelete = () => {
    dispatch(requestDeleteHighlight(highlight, {
      locationFilterId,
      pageId,
    }));
    trackDeleteHighlight(highlight.color, true);
  };

  return <HighlightOuterWrapper>
    {(!isEditing && !isDeleting) && <ContextMenu
      highlight={highlight}
      linkToHighlight={linkToHighlight}
      onDelete={() => setIsDeleting(true)}
      onEdit={() => setIsEditing(true)}
      onColorChange={updateColor}
    />}
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
      {
        confirming === true &&
        <HighlightDeleteWrapper
        deletingWhat='note'
        onCancel={() => {
          setConfirming(false);
          setIsEditing(false);
        }}
        onDelete={() => updateAnnotation('')}
      />
      }
    </HighlightContentWrapper>
    {isDeleting && <HighlightDeleteWrapper
      deletingWhat={highlight.annotation ? 'both' : 'highlight'}
      onCancel={() => setIsDeleting(false)}
      onDelete={confirmDelete}
    />}
  </HighlightOuterWrapper>;
};

export default HighlightListElement;
