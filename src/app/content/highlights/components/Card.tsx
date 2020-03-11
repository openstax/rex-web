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
import { mainStyles } from './cardStyles';
import DisplayNote from './DisplayNote';
import EditCard from './EditCard';

export interface CardProps {
  page: ReturnType<typeof selectContent['bookAndPage']>['page'];
  book: ReturnType<typeof selectContent['bookAndPage']>['book'];
  container?: HTMLElement;
  isFocused: boolean;
  user?: User;
  loginLink: string;
  highlighter: Highlighter;
  highlight: Highlight;
  create: typeof createHighlight;
  focus: typeof focusHighlight;
  save: typeof updateHighlight;
  remove: typeof deleteHighlight;
  blur: typeof clearFocusedHighlight;
  data?: HighlightData;
  className?: string;
  topOffset?: number;
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

// tslint:disable-next-line:variable-name
const Card = (props: CardProps) => {
  const annotation = props.data && props.data.annotation;
  const element = React.useRef<HTMLElement>(null);
  const [editing, setEditing] = React.useState<boolean>(!annotation);
  const locationFilters = useSelector(selectHighlights.highlightLocationFilters);

  const { isFocused } = props;

  React.useEffect(() => {
    if (element.current && isFocused) {
      props.onFocus();
    }
    if (!isFocused) {
      setEditing(false);
      props.onBlur();
    }
  }, [isFocused, element.current]);

  React.useEffect(() => {
    if (annotation) {
      props.highlight.elements.forEach((el) => (el as HTMLElement).classList.add('has-note'));
    } else {
      props.highlight.elements.forEach((el) => (el as HTMLElement).classList.remove('has-note'));
    }
  }, [props.highlight, annotation]);

  React.useEffect(() => {
    if (!annotation && !isFocused) {
      props.onHeightChange({ current: null } as React.RefObject<HTMLElement>);
    }
  }, [annotation, isFocused]);

  const handleClickOnCard = () => {
    if (!isFocused) {
      props.focus(props.highlight.id);
    }
  };

  const {page, book} = props;

  if (!props.highlight.range || !page || !book) {
    return null;
  }

  const location = getHighlightLocationFilterForPage(locationFilters, page);
  if (!location) { return null; }

  const locationFilterId = stripIdVersion(location.id);

  const onRemove = () => {
    if (props.data) {
      props.remove(props.data.id, {
        locationFilterId,
        pageId: page.id,
      });
    }
  };
  const style = highlightStyles.find((search) => props.data && search.label === props.data.color);

  const onCreate = () => {
    props.create({
      ...props.highlight.serialize().getApiPayload(props.highlighter, props.highlight),
      scopeId: book.id,
      sourceId: page.id,
      sourceType: NewHighlightSourceTypeEnum.OpenstaxPage,
    }, {
      locationFilterId,
      pageId: page.id,
    });
  };

  const commonProps = {
    className: props.className,
    isFocused: props.isFocused,
    onBlur: props.blur,
    onHeightChange: props.onHeightChange,
    onRemove,
    ref: element,
  };

  if (!props.isFocused && !annotation) { return null; }

  return <div onClick={handleClickOnCard}>
    {
      !editing && style && annotation ? <DisplayNote
        {...commonProps}
        style={style}
        note={annotation}
        onEdit={() => setEditing(true)}
      /> : <EditCard
        {...commonProps}
        highlight={props.highlight}
        authenticated={!!props.user}
        loginLink={props.loginLink}
        locationFilterId={locationFilterId}
        pageId={page.id}
        onCreate={onCreate}
        onCancel={() => setEditing(false)}
        onSave={props.save}
        data={props.data}
      />
    }
  </div>;
};

// tslint:disable-next-line: variable-name
const StyledCard = styled(Card)`
  ${mainStyles}
`;

export default connect(
  (state: AppState, ownProps: {highlight: Highlight}) => ({
    ...selectContent.bookAndPage(state),
    data: selectHighlights.highlights(state).find((search) => search.id === ownProps.highlight.id),
    hasQuery: !!selectSearch.query(state),
    isFocused: selectHighlights.focused(state) === ownProps.highlight.id,
    isOpen: contentSelect.tocOpen(state),
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
