import Highlighter, { Highlight, SerializedHighlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import { AppState, Dispatch } from '../../../types';
import { assertDocument } from '../../../utils';
import { createHighlight, deleteHighlight } from '../../highlights/actions';
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
  create: flow(createHighlight, dispatch),
  remove: flow(deleteHighlight, dispatch),
});
export type HighlightProp = ReturnType<typeof mapStateToHighlightProp>
  & ReturnType<typeof mapDispatchToHighlightProp>;

const onClickHighlight = (services: Services, highlight: Highlight | undefined) => {
  if (highlight) {
    const styleIndex = highlightStyles.findIndex((search) => search.label === highlight.getStyle());
    const nextStyle = highlightStyles[styleIndex + 1];

    if (nextStyle) {
      highlight.setStyle(nextStyle.label);
    } else {
      const {remove} = services.getProp();
      services.highlighter.erase(highlight);
      remove(highlight.id);
    }
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

const highlightData = (highlighter: Highlighter) => (data: SerializedHighlight['data']) =>
  highlighter.highlight(new SerializedHighlight(data));

export default (container: HTMLElement, getProp: () => HighlightProp) => {
  let highlighter: Highlighter | undefined;

  const services = {
    container,
    getProp,
  };

  if (getProp().enabled) {
    highlighter = createHighlighter(services);
  }

  return {
    unmount: (): void => highlighter && highlighter.unmount(),
    update: () => {
      if (!highlighter && getProp().enabled) {
        highlighter = createHighlighter(services);
      }
      if (highlighter) {
        getProp().highlights
          .filter(isUnknownHighlightData(highlighter))
          .forEach(highlightData(highlighter))
        ;
      }
      if (highlighter && getProp().highlights.length === 0) {
        highlighter.eraseAll();
      }
    },
  };
};

export const stubHighlightManager = ({
  unmount: (): void => undefined,
  update: (): void => undefined,
});
