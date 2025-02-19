import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { user } from '../../../auth/selectors';
import { User } from '../../../auth/types';
import GoToTopButton from '../../../components/GoToTopButton';
import withServices from '../../../context/Services';
import { isHtmlElement } from '../../../guards';
import { AppServices, AppState, Dispatch } from '../../../types';
import { loadMoreDistanceFromBottom } from '../../constants';
import { initializeMyHighlightsSummary, loadMoreSummaryHighlights } from '../actions';
import * as select from '../selectors';
import { SummaryHighlights } from '../types';
import Highlights from './Highlights';
import HighlightsToasts from './HighlightsToasts';
import * as Styled from './ShowMyHighlightsStyles';
import Filters from './SummaryPopup/Filters';
import { ServiceConsumer } from '../../../context/Services';

interface ShowMyHighlightsProps {
  authenticated: User | undefined;
  hasMoreResults: boolean;
  summaryHighlights: SummaryHighlights | null;
  summaryIsLoading: boolean;
  loadMore: () => void;
  initMyHighlights: () => void;
  services: AppServices;
  topElRef: React.RefObject<HTMLElement>;
}

class ShowMyHighlights extends Component<ShowMyHighlightsProps, { showGoToTop: boolean }> {
  public myHighlightsBodyRef = React.createRef<HTMLElement>();

  public state = { showGoToTop: false };

  private scrollHandler: (() => void) | undefined;

  public scrollToTop = () => {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (!highlightsBodyRef) {
      return;
    }

    this.props.topElRef.current?.focus();
    highlightsBodyRef.scrollTop = 0;
  };

  public updateGoToTop = (bodyElement: HTMLElement) => {
    if (bodyElement.scrollTop > 0) {
      this.setState({ showGoToTop: true });
    } else {
      this.setState({ showGoToTop: false });
    }
  };

  public fetchMoreHighlights = (bodyElement: HTMLElement) => {
    if (this.props.summaryIsLoading) { return; }
    const scrollBottom = bodyElement.scrollHeight - bodyElement.offsetHeight - bodyElement.scrollTop;
    if (scrollBottom <= loadMoreDistanceFromBottom && this.props.hasMoreResults) {
      this.props.loadMore();
    }
  };

  public componentDidMount() {
    if (this.props.authenticated && this.props.summaryIsLoading === false && this.props.summaryHighlights === null) {
      this.props.initMyHighlights();
    }

    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (isHtmlElement(highlightsBodyRef)) {
      this.scrollHandler = () => {
        this.updateGoToTop(highlightsBodyRef);
        this.fetchMoreHighlights(highlightsBodyRef);
      };
      highlightsBodyRef.addEventListener('scroll', this.scrollHandler);
    }
  }

  public componentWillUnmount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (this.scrollHandler && isHtmlElement(highlightsBodyRef)) {
      highlightsBodyRef.removeEventListener('scroll', this.scrollHandler);
    }
  }

  public render() {
    return (
      <Styled.ShowMyHighlightsBody
        ref={this.myHighlightsBodyRef}
        data-testid='show-myhighlights-body'
        data-analytics-region='MH popup'
      >
        <HighlightsToasts />
        <Filters />
        <Highlights />
        {this.state.showGoToTop && <GoToTopButton
          i18nAriaLabel='i18n:toolbar:highlights:popup:button:back-to-top'
          onClick={this.scrollToTop}
          data-testid='back-to-top-highlights'
        />}
      </Styled.ShowMyHighlightsBody>
    );
  }
}

const connector = connect(
  (state: AppState) => ({
    authenticated: user(state),
    hasMoreResults: select.hasMoreResults(state),
    summaryHighlights: select.summaryHighlights(state),
    summaryIsLoading: select.summaryIsLoading(state),
  }),
  (dispatch: Dispatch) => ({
    initMyHighlights: () => dispatch(initializeMyHighlightsSummary()),
    loadMore: () => dispatch(loadMoreSummaryHighlights()),
  })
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default flow(withServices, connector)(ShowMyHighlights as unknown as React.ComponentType<ServiceConsumer>);
