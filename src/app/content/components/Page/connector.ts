import { IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import * as selectNavigation from '../../../navigation/selectors';
import { AppServices, AppState } from '../../../types';
import { merge } from '../../../utils';
import { mobileToolbarOpen, query } from '../../search/selectors';
import * as select from '../../selectors';
import { State } from '../../types';
import { ContentLinkProp, mapDispatchToContentLinkProp, mapStateToContentLinkProp } from './contentLinkHandler';
import { HighlightProp, mapDispatchToHighlightProp, mapStateToHighlightProp } from './highlightManager';
import { mapStateToScrollTargetProp } from './scrollTargetManager';
import { mapStateToSearchHighlightProp } from './searchHighlightManager';

export interface PagePropTypes {
  intl: IntlShape;
  page: State['page'];
  pageNotFound: ReturnType<typeof select.pageNotFound>;
  book: State['book'];
  currentPath: string;
  className?: string;
  mobileToolbarOpen: boolean;
  contentLinks: ContentLinkProp;
  locationState: ReturnType<typeof selectNavigation.locationState>;
  query: string | null;
  scrollTarget: ReturnType<typeof mapStateToScrollTargetProp>;
  searchHighlights: ReturnType<typeof mapStateToSearchHighlightProp>;
  highlights: HighlightProp;
  services: AppServices;
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
    scrollTarget: mapStateToScrollTargetProp(state),
    searchHighlights: mapStateToSearchHighlightProp(state),
  }),
  (dispatch) => ({
    contentLinks: mapDispatchToContentLinkProp(dispatch),
    highlights: mapDispatchToHighlightProp(dispatch),
  }),
  merge
);
