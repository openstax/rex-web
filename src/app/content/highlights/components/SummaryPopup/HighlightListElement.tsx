import { Highlight, HighlightColorEnum, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useDispatch } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../../../helpers/analytics';
import { bodyCopyRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { highlightStyles } from '../../../constants';
import { popupBodyPadding } from '../../../styles/PopupStyles';
import addTargetBlankToLinks from '../../../utils/addTargetBlankToLinks';
import { deleteHighlight, updateHighlight } from '../../actions';
import ContextMenu from './ContextMenu';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';

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
const HighlightContent = styled.div`
  ${bodyCopyRegularStyle}
  overflow: auto;

  * {
    overflow: initial;
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

      ${HighlightContent} {
        background-color: ${style.passive};
      }

      .highlight-note-text {
        color: ${style.focused};
      }
    `;
  }}

  @media print {
    break-inside: avoid-page;

    ${HighlightContent} {
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
  const dispatch = useDispatch();

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
    }));
    trackEditNoteColor(color, true);
  };

  const confirmDelete = () => {
    dispatch(deleteHighlight(highlight.id, {
      locationFilterId,
      pageId,
    }));
    trackDeleteHighlight(highlight.color, true);
  };

  const hasAnnotation = Boolean(highlight.annotation);

  const content = React.useMemo(
    () => addTargetBlankToLinks(highlight.highlightedContent),
    [highlight.highlightedContent]);

  return <HighlightOuterWrapper>
    {!isEditing && <ContextMenu
      color={highlight.color}
      hasAnnotation={hasAnnotation}
      onDelete={() => setIsDeleting(true)}
      onEdit={() => setIsEditing(true)}
      onColorChange={updateColor}
    />}
    <HighlightContentWrapper color={highlight.color}>
      <HighlightContent
        className='summary-highlight-content'
        data-highlight-id={highlight.id}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <HighlightAnnotation
        annotation={highlight.annotation || ''}
        isEditing={isEditing}
        onSave={updateAnnotation}
        onCancel={() => setIsEditing(false)}
      />
    </HighlightContentWrapper>
    {isDeleting && <HighlightDeleteWrapper
      hasAnnotation={hasAnnotation}
      onCancel={() => setIsDeleting(false)}
      onDelete={confirmDelete}
    />}
  </HighlightOuterWrapper>;
};

export default HighlightListElement;
