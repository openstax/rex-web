import { Highlight, HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import DynamicContentStyles from '../../../../components/DynamicContentStyles';
import theme from '../../../../theme';
import ContentExcerpt from '../../../components/ContentExcerpt';
import { highlightStyles } from '../../../constants';
import { book as bookSelector } from '../../../selectors';
import { popupBodyPadding } from '../../../styles/PopupStyles';
import { requestDeleteHighlight, updateHighlight } from '../../actions';
import ContextMenu from './ContextMenu';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';
import { createHighlightLink } from './utils';

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
        color: ${style.focused};
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
  highlight: Highlight;
  locationFilterId: string;
  pageId: string;
}

// tslint:disable-next-line:variable-name
const HighlightListElement = ({ highlight, locationFilterId, pageId }: HighlightListElementProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const book = useSelector(bookSelector);
  const dispatch = useDispatch();
  const linkToHighlight = React.useMemo(() => createHighlightLink(highlight, book), [highlight, book]);

  const trackEditNoteColor = useAnalyticsEvent('editNoteColor');
  const trackEditAnnotation = useAnalyticsEvent('editAnnotation');
  const trackDeleteHighlight = useAnalyticsEvent('deleteHighlight');

  const updateAnnotation = (
    annotation: string
  ) => {
    const addedNote = (highlight.annotation === undefined);

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
  };

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
    {!isEditing && <ContextMenu
      highlight={highlight}
      linkToHighlight={linkToHighlight}
      onDelete={() => setIsDeleting(true)}
      onEdit={() => setIsEditing(true)}
      onColorChange={updateColor}
    />}
    <HighlightContentWrapper color={highlight.color}>
      <DynamicContentStyles>
        <ContentExcerpt
          data-highlight-id={highlight.id}
          content={highlight.highlightedContent}
          source={highlight.sourceId}
        />
      </DynamicContentStyles>
      <HighlightAnnotation
        annotation={highlight.annotation || ''}
        isEditing={isEditing}
        onSave={updateAnnotation}
        onCancel={() => setIsEditing(false)}
      />
    </HighlightContentWrapper>
    {isDeleting && <HighlightDeleteWrapper
      hasAnnotation={Boolean(highlight.annotation)}
      onCancel={() => setIsDeleting(false)}
      onDelete={confirmDelete}
    />}
  </HighlightOuterWrapper>;
};

export default HighlightListElement;
