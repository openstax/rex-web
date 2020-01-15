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

  const updateAnnotation = (
    annotation: string
  ) => {
    dispatch(updateHighlight({
      highlight: {annotation},
      id: highlight.id,
    }, {
      locationFilterId,
      pageId,
    }));
    setIsEditing(false);
  };

  const updateColor = (color: string) => {
    dispatch(updateHighlight({
      highlight: {color: color as HighlightUpdateColorEnum},
      id: highlight.id,
    }, {
      locationFilterId,
      pageId,
    }));
  };

  const confirmDelete = () => {
    dispatch(deleteHighlight(highlight.id, {
      locationFilterId,
      pageId,
    }));
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
          isEditing={isEditing}
          onSave={updateAnnotation}
          onCancel={() => setIsEditing(false)}
        />
      ) : null}
    </Styled.HighlightContentWrapper>
    {isDeleting && <HighlightDeleteWrapper
      onCancel={() => setIsDeleting(false)}
      onDelete={confirmDelete}
    />}
  </Styled.HighlightOuterWrapper>;
};

export default HighlightData;
