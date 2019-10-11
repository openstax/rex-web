import Highlighter from '@openstax/highlighter';
import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import { AppState } from '../../../types';
import { assertDocument } from '../../../utils';
import * as selectHighlights from '../../highlights/selectors';
import * as select from '../../selectors';

interface Services {
  getProp: () => HighlightProp;
  highlighter: Highlighter;
  container: HTMLElement;
}

export const mapStateToHighlightProp = (state: AppState) => ({
  enabled: selectHighlights.isEnabled(state),
  page: select.page(state),
});
export type HighlightProp = ReturnType<typeof mapStateToHighlightProp>;

const onClickHighlight = (services: Services, highlight: Highlight | undefined) => {
  if (highlight) {
    services.highlighter.erase(highlight);
  }
};

const onSelectHighlight = (services: Services, highlights: Highlight[], highlight: Highlight | undefined) => {
  if (highlights.length > 0) {
    return;
  }
  services.highlighter.highlight(highlight);

  const selection = assertDocument().getSelection();

  if (selection) {
    selection.removeAllRanges();
  }
};

export default (container: HTMLElement, getProp: () => HighlightProp) => {
  if (!getProp().enabled) {
    return stubHighlightManager;
  }

  const services: Services = {
    container,
    getProp,
    highlighter: new Highlighter(container, {
      onClick: (...args) => onClickHighlight(services, ...args),
      onSelect: (...args) => onSelectHighlight(services, ...args),
      snapMathJax: true,
      snapTableRows: true,
      snapWords: true,
    }),
  };

  return {
    unmount: () => services.highlighter.unmount(),
  };
};

export const stubHighlightManager = ({
  unmount: (): void => undefined,
});
