import { HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import htmlMessage from '../../../components/htmlMessage';
import Loader from '../../../components/Loader';
import { assertDefined } from '../../../utils';
import { LinkedArchiveTreeNode } from '../../types';
import { archiveTreeSectionIsChapter, findArchiveTreeNode } from '../../utils/archiveTreeUtils';
import { stripIdVersion } from '../../utils/idUtils';
import { deleteHighlight, updateHighlight } from '../actions';
import { highlightLocationFilters, summaryFilters, summaryHighlights, summaryIsLoading } from '../selectors';
import { HighlightData, SummaryHighlights } from '../types';
import HighlightAnnotation from './HighlightAnnotation';
import HighlightDeleteWrapper from './HighlightDeleteWrapper';
import * as HStyled from './HighlightStyles';
import HighlightToggleEdit from './HighlightToggleEdit';
import * as Styled from './ShowMyHighlightsStyles';

// tslint:disable-next-line: variable-name
const NoHighlightsTip = htmlMessage(
  'i18n:toolbar:highlights:popup:heading:no-highlights-tip',
  (props) => <span {...props} />
);

// tslint:disable-next-line: variable-name
const Highlights = () => {
  const filters = useSelector(summaryFilters);
  const locationFilters = useSelector(highlightLocationFilters);
  const highlights = useSelector(summaryHighlights);
  const isLoading = useSelector(summaryIsLoading);

  if (
    !isLoading &&
    (filters.colors.length === 0 || filters.locationIds.length === 0)
  ) {
    return <Styled.Highlights>
      <HStyled.GeneralCenterText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
        <NoHighlightsTip />
      </HStyled.GeneralCenterText>
    </Styled.Highlights>;
  }

  if (
    isLoading ||
    (locationFilters.size > 0 && Object.keys(highlights).length > 0)
  ) {
    return <React.Fragment>
      {isLoading ? <Styled.LoaderWrapper><Loader large /></Styled.LoaderWrapper> : null}
      <Styled.Highlights>
        {Array.from(locationFilters).map(([id, location]) => {
          if (!highlights[id]) { return null; }
          return <SectionHighlights
            key={id}
            location={location}
            highlights={highlights}
          />;
        })}
      </Styled.Highlights>
    </React.Fragment>;
  }

  return <Styled.Highlights>
    <HStyled.GeneralLeftText>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:no-highlights-in-chapter'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </HStyled.GeneralLeftText>
    <HStyled.MyHighlightsWrapper>
      <HStyled.GeneralText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:add-highlight'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </HStyled.GeneralText>
      <HStyled.GeneralTextWrapper>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:use-this-page'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </HStyled.GeneralTextWrapper>
      <HStyled.MyHighlightsImage src={myHighlightsEmptyImage} />
    </HStyled.MyHighlightsWrapper>
  </Styled.Highlights>;
};

export default Highlights;

interface SectionHighlightsProps {
  location: LinkedArchiveTreeNode;
  highlights: SummaryHighlights;
}

// tslint:disable-next-line: variable-name
export const SectionHighlights = ({ location, highlights }: SectionHighlightsProps) => {
  const [highlightIdToEdit, setHighlightIdToEdit] = React.useState<string | null>(null);
  const [highlightIdToDelete, setHighlightIdToDelete] = React.useState<string | null>(null);
  const dispatch = useDispatch();

  const onHighlightEdit = (id: string) => {
    setHighlightIdToEdit(id);
  };

  const updateAnnotation = (
    annotation: string, highlight: HighlightData, locationFilterId: string, pageId: string
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

  const updateColor = (
    color: string, id: string, locationFilterId: string, pageId: string
  ) => {
    dispatch(updateHighlight({
      highlight: {color: color as HighlightUpdateColorEnum},
      id,
    }, {
      locationFilterId,
      pageId,
    }));
    cancelEdit();
  };

  const cancelEdit = () => {
    setHighlightIdToEdit(null);
  };

  const onHighlightDelete = (id: string) => {
    setHighlightIdToDelete(id);
  };

  const confimDelete = (locationFilterId: string, pageId: string) => {
    const id = assertDefined(highlightIdToDelete, 'highlightIdToDelete was undefined');
    dispatch(deleteHighlight(id, {
      locationFilterId,
      pageId,
    }));
    cancelDelete();
  };

  const cancelDelete = () => {
    setHighlightIdToDelete(null);
  };

  const pageIdIsSameAsSectionId = highlights[location.id][location.id];
  return (
    <React.Fragment>
      <Styled.HighlightsChapter
        dangerouslySetInnerHTML={{ __html: location.title }}
      />
      {Object.entries(highlights[location.id]).map(([pageId, pageHighlights]) => {
        const page = assertDefined(
          archiveTreeSectionIsChapter(location)
            ? findArchiveTreeNode(location, stripIdVersion(pageId))
            : location,
          `Page is undefined in SectionHighlights`
        );
        return <Styled.HighlightWrapper key={pageId}>
          {!pageIdIsSameAsSectionId && <Styled.HighlightSection
            dangerouslySetInnerHTML={{ __html: page.title }}
          />}
          {pageHighlights.map((item) => {
            return (
              <Styled.HighlightOuterWrapper key={item.id}>
                <HighlightToggleEdit
                  color={item.color}
                  onDelete={() => onHighlightDelete(item.id)}
                  onEdit={() => onHighlightEdit(item.id)}
                  onColorChange={(color) => updateColor(color, item.id, location.id, pageId)}
                />
                <Styled.HighlightContentWrapper color={item.color}>
                  <Styled.HighlightContent
                    className='summary-highlight-content'
                    dangerouslySetInnerHTML={{ __html: item.highlightedContent }}
                  />
                  {item.annotation ? (
                    <HighlightAnnotation
                      annotation={item.annotation}
                      isEditable={highlightIdToEdit === item.id}
                      onSave={(anno) => updateAnnotation(anno, item, location.id, pageId)}
                      onCancel={cancelEdit}
                    />
                  ) : null}
                </Styled.HighlightContentWrapper>
                {highlightIdToDelete === item.id && <HighlightDeleteWrapper
                  onCancel={cancelDelete}
                  onDelete={() => confimDelete(location.id, pageId)}
                />}
              </Styled.HighlightOuterWrapper>
            );
          })}
        </Styled.HighlightWrapper>;
      })}
    </React.Fragment>
  );
};
