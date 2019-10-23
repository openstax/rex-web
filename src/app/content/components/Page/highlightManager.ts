import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React from 'react';
import { isDefined } from '../../../guards';
import { AppState, Dispatch } from '../../../types';
import { assertDocument } from '../../../utils';
import {
  clearFocusedHighlight,
  createHighlight,
  deleteHighlight,
  focusHighlight,
  updateHighlight
} from '../../highlights/actions';
import CardWrapper from '../../highlights/components/CardWrapper';
import { highlightStyles } from '../../highlights/constants';
import * as selectHighlights from '../../highlights/selectors';
import * as select from '../../selectors';

interface Services {
  getProp: () => HighlightProp;
  highlighter: Highlighter;
  container: HTMLElement;
}

export const mapStateToHighlightProp = (state: AppState) => ({
  enabled: selectHighlights.isEnabled(state),
  highlights: selectHighlights.highlights(state),
  page: select.page(state),
});
export const mapDispatchToHighlightProp = (dispatch: Dispatch) => ({
  clearFocus: flow(clearFocusedHighlight, dispatch),
  create: flow(createHighlight, dispatch),
  focus: flow(focusHighlight, dispatch),
  remove: flow(deleteHighlight, dispatch),
  update: flow(updateHighlight, dispatch),
});
export type HighlightProp = ReturnType<typeof mapStateToHighlightProp>
  & ReturnType<typeof mapDispatchToHighlightProp>;

const onClickHighlight = (services: Services, highlight: Highlight | undefined) => {
  if (highlight) {
    services.getProp().focus(highlight.id);
    services.highlighter.clearFocus();
    highlight.focus();
  } else {
    services.getProp().clearFocus();
    services.highlighter.clearFocus();
  }
};

const onSelectHighlight = (services: Services, highlights: Highlight[], highlight: Highlight | undefined) => {
  if (highlights.length > 0 || !highlight) {
    return;
  }
  const {create} = services.getProp();

  highlight.setStyle(highlightStyles[0].label);
  services.highlighter.highlight(highlight);

  create(highlight.serialize().data);

  const selection = assertDocument().getSelection();

  if (selection) {
    selection.removeAllRanges();
  }
};

const createHighlighter = (services: Omit<Services, 'highlighter'>) => {
  const highlighter: Highlighter = new Highlighter(services.container, {
    onClick: (...args) => onClickHighlight({...services, highlighter}, ...args),
    onSelect: (...args) => onSelectHighlight({...services, highlighter}, ...args),
    snapMathJax: true,
    snapTableRows: true,
    snapWords: true,
  });

  return highlighter;
};

const isUnknownHighlightData = (highlighter: Highlighter) => (data: SerializedHighlight['data']) =>
  !highlighter.getHighlight(data.id);

const highlightData = (services: Services) => (data: SerializedHighlight['data']) => {
  const {highlighter} = services;

  const serialized = new SerializedHighlight(data);

  highlighter.highlight(serialized);

  return highlighter.getHighlight(data.id);
};

const erase = (highlighter: Highlighter) => (highlight: Highlight) => highlighter.erase(highlight);

export default (container: HTMLElement, getProp: () => HighlightProp) => {
  let highlighter: Highlighter | undefined;
  let setListHighlighter = (_highlighter: Highlighter): void => undefined;
  let setListHighlights = (_highlights: Highlight[]): void => undefined;

  const services = {
    container,
    getProp,
  };

  if (getProp().enabled) {
    highlighter = createHighlighter(services);
    setListHighlighter(highlighter);
  }

  return {
    CardList: () => {
      const [listHighlighter, setHighlighter] = React.useState<Highlighter | undefined>(highlighter);
      const [listHighlights, setHighlights] = React.useState<Highlight[]>([]);

      setListHighlighter = setHighlighter;
      setListHighlights = setHighlights;

      if (listHighlighter) {
        return React.createElement(CardWrapper, {
          highlighter: listHighlighter,
          highlights: listHighlights,
        });
      }
      return null;
    },
    unmount: (): void => highlighter && highlighter.unmount(),
    update: () => {
      if (!highlighter && getProp().enabled) {
        highlighter = createHighlighter(services);
        setListHighlighter(highlighter);
      }
      if (!highlighter) {
        return;
      }

      const newHighlights = getProp().highlights
        .filter(isUnknownHighlightData(highlighter))
        .map(highlightData({...services, highlighter}))
        .filter(isDefined)
      ;

      const removedHighlights = highlighter.getHighlights()
        .filter((highlight) => !getProp().highlights.find((search) => search.id === highlight.id))
        .map(erase(highlighter))
      ;

      if (newHighlights.length > 0 || removedHighlights.length > 0) {
        setListHighlights(highlighter.getHighlights());
      }

      if (getProp().highlights.length === 0) {
        highlighter.eraseAll();
        setListHighlights([]);
      }
    },
  };
};

export const stubHighlightManager = ({
  CardList: (() => null) as React.FC,
  unmount: (): void => undefined,
  update: (): void => undefined,
});
