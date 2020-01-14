import { Highlight, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useDispatch } from 'react-redux';
import { deleteHighlight, updateHighlight } from '../actions';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';
import HighlightToggleEdit from './HighlightToggleEdit';
import * as Styled from './ShowMyHighlightsStyles';

interface HighlightDataProps {
  highlight: Highlight;
  locationFilterId: string;
  pageId: string;
}

// tslint:disable-next-line:variable-name
const HighlightData = ({ highlight, locationFilterId, pageId }: HighlightDataProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const dispatch = useDispatch();

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const updateAnnotation = (
    annotation: string
  ) => {
    dispatch(updateHighlight({
      highlight: {annotation, color: highlight.color as string as HighlightUpdateColorEnum},
      id: highlight.id,
    }, {
      locationFilterId,
      pageId,
    }));
    cancelEdit();
  };

  const updateColor = (color: string) => {
    dispatch(updateHighlight({
      highlight: {color: color as HighlightUpdateColorEnum},
      id: highlight.id,
    }, {
      locationFilterId,
      pageId,
    }));
    cancelEdit();
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  const confirmDelete = () => {
    dispatch(deleteHighlight(highlight.id, {
      locationFilterId,
      pageId,
    }));
    cancelDelete();
  };

  return <Styled.HighlightOuterWrapper>
    <HighlightToggleEdit
      color={highlight.color}
      onDelete={() => setIsDeleting(true)}
      onEdit={() => setIsEditing(true)}
      onColorChange={updateColor}
    />
    <Styled.HighlightContentWrapper color={highlight.color}>
      <Styled.HighlightContent
        className='summary-highlight-content'
        dangerouslySetInnerHTML={{ __html: highlight.highlightedContent }}
      />
      {highlight.annotation ? (
        <HighlightAnnotation
          annotation={highlight.annotation}
          isEditable={isEditing}
          onSave={updateAnnotation}
          onCancel={cancelEdit}
        />
      ) : null}
    </Styled.HighlightContentWrapper>
    {isDeleting && <HighlightDeleteWrapper
      onCancel={cancelDelete}
      onDelete={confirmDelete}
    />}
  </Styled.HighlightOuterWrapper>;
};

export default HighlightData;
