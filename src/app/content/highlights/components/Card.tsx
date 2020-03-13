import Highlighter, { Highlight } from '@openstax/highlighter';
import { NewHighlightSourceTypeEnum } from '@openstax/highlighter/dist/api';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components';
import * as selectAuth from '../../../auth/selectors';
import { User } from '../../../auth/types';
import { AppState, Dispatch } from '../../../types';
import * as selectHighlights from '../../highlights/selectors';
import * as selectSearch from '../../search/selectors';
import * as selectContent from '../../selectors';
import * as contentSelect from '../../selectors';
import { stripIdVersion } from '../../utils/idUtils';
import { clearFocusedHighlight, createHighlight, deleteHighlight, focusHighlight, updateHighlight } from '../actions';
import { highlightStyles } from '../constants';
import { HighlightData } from '../types';
import { getHighlightLocationFilterForPage } from '../utils';
import { mainCardStyles } from './cardStyles';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';

export interface CardProps {
  page: ReturnType<typeof selectContent['bookAndPage']>['page'];
  book: ReturnType<typeof selectContent['bookAndPage']>['book'];
  container?: HTMLElement;
  isFocused: boolean;
  isTocOpen: boolean;
  hasQuery: boolean;
  user: User;
  loginLink: string;
  highlighter: Highlighter;
  highlight: Highlight;
  create: typeof createHighlight;
  focus: typeof focusHighlight;
  save: typeof updateHighlight;
  remove: typeof deleteHighlight;
  blur: typeof clearFocusedHighlight;
  data?: HighlightData;
  className: string;
  topOffset?: number;
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

// tslint:disable-next-line:variable-name
const Card = ({
  book,
  blur,
  className,
  create,
  data,
  focus,
  highlight,
  highlighter,
  loginLink,
  isFocused,
  onFocus,
  onBlur,
  onHeightChange,
  page,
  remove,
  save,
  user,
}: CardProps) => {
  const annotation = data && data.annotation;
  const element = React.useRef<HTMLElement>(null);
  const [editing, setEditing] = React.useState<boolean>(!annotation);
  const locationFilters = useSelector(selectHighlights.highlightLocationFilters);

  React.useEffect(() => {
    if (element.current && isFocused) {
      onFocus();
    }
    if (!isFocused) {
      setEditing(false);
      onBlur();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, element]);

  React.useEffect(() => {
    if (annotation) {
      highlight.elements.forEach((el) => (el as HTMLElement).classList.add('has-note'));
    } else {
      highlight.elements.forEach((el) => (el as HTMLElement).classList.remove('has-note'));
    }
  }, [highlight, annotation]);

  React.useEffect(() => {
    if (!annotation && !isFocused) {
      onHeightChange({ current: null } as React.RefObject<HTMLElement>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotation, isFocused]);

  const location = React.useMemo(() => {
    return page && getHighlightLocationFilterForPage(locationFilters, page);
  }, [locationFilters, page]);

  const locationFilterId = location && stripIdVersion(location.id);

  if (!highlight.range || !page || !book || !locationFilterId || (!isFocused && !annotation)) {
    return null;
  }

  const handleClickOnCard = () => {
    if (!isFocused) {
      focus(highlight.id);
    }
  };

  const onRemove = () => {
    if (data) {
      remove(data.id, {
        locationFilterId,
        pageId: page.id,
      });
    }
  };
  const style = highlightStyles.find((search) => data && search.label === data.color);

  const onCreate = () => {
    create({
      ...highlight.serialize().getApiPayload(highlighter, highlight),
      scopeId: book.id,
      sourceId: page.id,
      sourceType: NewHighlightSourceTypeEnum.OpenstaxPage,
    }, {
      locationFilterId,
      pageId: page.id,
    });
  };

  const commonProps = {
    className,
    isFocused,
    onBlur: blur,
    onHeightChange,
    onRemove,
    ref: element,
  };

  return <div onClick={handleClickOnCard}>
    {
      !editing && style && annotation ? <DisplayNote
        {...commonProps}
        style={style}
        note={annotation}
        onEdit={() => setEditing(true)}
      /> : <EditCard
        {...commonProps}
        highlight={highlight}
        authenticated={!!user}
        loginLink={loginLink}
        locationFilterId={locationFilterId}
        pageId={page.id}
        onCreate={onCreate}
        onCancel={() => setEditing(false)}
        onSave={save}
        data={data}
      />
    }
  </div>;
};

// tslint:disable-next-line: variable-name
const StyledCard = styled(Card)`
  ${mainCardStyles}
`;

export default connect(
  (state: AppState, ownProps: {highlight: Highlight}) => ({
    ...selectContent.bookAndPage(state),
    data: selectHighlights.highlights(state).find((search) => search.id === ownProps.highlight.id),
    hasQuery: !!selectSearch.query(state),
    isFocused: selectHighlights.focused(state) === ownProps.highlight.id,
    isTocOpen: contentSelect.tocOpen(state),
    loginLink: selectAuth.loginLink(state),
    user: selectAuth.user(state),
  }),
  (dispatch: Dispatch) => ({
    blur: flow(clearFocusedHighlight, dispatch),
    create: flow(createHighlight, dispatch),
    focus: flow(focusHighlight, dispatch),
    remove: flow(deleteHighlight, dispatch),
    save: flow(updateHighlight, dispatch),
  })
)(StyledCard);
