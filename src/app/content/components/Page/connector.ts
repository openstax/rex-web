import flow from 'lodash/fp/flow';
import { IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import * as selectNavigation from '../../../navigation/selectors';
import { addToast } from '../../../notifications/actions';
import { AppServices, AppState, MiddlewareAPI } from '../../../types';
import { merge } from '../../../utils';
import { TextResizerValue } from '../../constants';
import { mobileToolbarOpen, query } from '../../search/selectors';
import * as select from '../../selectors';
import { State, SystemQueryParams } from '../../types';
import { ContentLinkProp, mapDispatchToContentLinkProp, mapStateToContentLinkProp } from './contentLinkHandler';
import { HighlightProp, mapDispatchToHighlightProp, mapStateToHighlightProp } from './highlightManager';
import { mapStateToScrollToTopOrHashProp } from './scrollToTopOrHashManager';
import { mapStateToSearchHighlightProp } from './searchHighlightManager';
import { StyledComponent } from 'styled-components';

export interface PagePropTypes {
  intl: IntlShape;
  page: State['page'];
  pageNotFound: ReturnType<typeof select.pageNotFound>;
  book: State['book'];
  currentPath: string;
  className?: string;
  mobileToolbarOpen: boolean;
  contentLinks: ContentLinkProp;
  query: string | null;
  scrollToTopOrHash: ReturnType<typeof mapStateToScrollToTopOrHashProp>;
  searchHighlights: ReturnType<typeof mapStateToSearchHighlightProp>;
  highlights: HighlightProp;
  services: AppServices & MiddlewareAPI;
  addToast: typeof addToast;
  systemQueryParams: SystemQueryParams;
  textSize: TextResizerValue;
  lockNavigation: boolean;
  ToastOverride: StyledComponent<'div', object, {}, never>;
  topHeadingLevel?: number;
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    contentLinks: mapStateToContentLinkProp(state),
    currentPath: selectNavigation.pathname(state),
    highlights: mapStateToHighlightProp(state),
    mobileToolbarOpen: mobileToolbarOpen(state),
    page: select.page(state),
    pageNotFound: select.pageNotFound(state),
    query: query(state),
    scrollToTopOrHash: mapStateToScrollToTopOrHashProp(state),
    searchHighlights: mapStateToSearchHighlightProp(state),
    systemQueryParams: selectNavigation.systemQueryParameters(state),
    textSize: select.textSize(state),
  }),
  (dispatch) => ({
    addToast: flow(addToast, dispatch),
    contentLinks: mapDispatchToContentLinkProp(dispatch),
    highlights: mapDispatchToHighlightProp(dispatch),
  }),
  (stateProps, dispatchProps, ownProps) => ({
    // the subscopes need to be deep merged
    ...merge(stateProps, dispatchProps),
    ...ownProps,
  })
);
