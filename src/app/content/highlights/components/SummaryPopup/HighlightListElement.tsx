import { Highlight, HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useDispatch } from 'react-redux';
import styled, { css } from 'styled-components';
import { bodyCopyRegularStyle } from '../../../../components/Typography';
import theme from '../../../../theme';
import { deleteHighlight, updateHighlight } from '../../actions';
import { highlightStyles } from '../../constants';
import { popupBodyPadding } from '../HighlightStyles';
import ContextMenu from './ContextMenu';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';

// tslint:disable-next-line:variable-name
const HighlightOuterWrapper = styled.div`
  position: relative;
  overflow: unset;

  :not(:last-child) {
    border-bottom: solid 0.2rem ${theme.color.neutral.darker};
  }

  background: ${theme.color.neutral.base};
`;

// tslint:disable-next-line:variable-name
const HighlightContent = styled.div`
  ${bodyCopyRegularStyle}
  overflow: visible;

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

  return <HighlightOuterWrapper>
    <ContextMenu
      color={highlight.color}
      onDelete={() => setIsDeleting(true)}
      onEdit={() => setIsEditing(true)}
      onColorChange={updateColor}
    />
    <HighlightContentWrapper color={highlight.color}>
      <HighlightContent
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
    </HighlightContentWrapper>
    {isDeleting && <HighlightDeleteWrapper
      onCancel={() => setIsDeleting(false)}
      onDelete={confirmDelete}
    />}
  </HighlightOuterWrapper>;
};

export default HighlightListElement;
