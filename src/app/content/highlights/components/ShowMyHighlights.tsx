import { HTMLElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import isEqual from 'lodash/fp/isEqual';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { typesetMath } from '../../../../helpers/mathjax';
import withServices from '../../../context/Services';
import { isHtmlElement } from '../../../guards';
import { AppServices, AppState, Dispatch } from '../../../types';
import { assertWindow, lastProp } from '../../../utils';
import allImagesLoaded from '../../components/utils/allImagesLoaded';
import { loadMoreSummaryHighlights, printSummaryHighlights } from '../actions';
import { loadMoreDistanceFromBottom } from '../constants';
import * as select from '../selectors';
import { SummaryHighlights } from '../types';
import Highlights from './Highlights';
import * as Styled from './ShowMyHighlightsStyles';
import Filters from './SummaryPopup/Filters';

interface ShowMyHighlightsProps {
  hasMoreResults: boolean;
  summaryHighlights: SummaryHighlights | null;
  summaryIsLoading: boolean;
  loadMore: () => void;
  printHighlights: () => void;
  services: AppServices;
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

  public printHighlights = () => {
    if (this.props.hasMoreResults) {
      this.props.printHighlights();
    } else {
      assertWindow().print();
    }
  };

  public componentDidMount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (isHtmlElement(highlightsBodyRef)) {
      this.scrollHandler = () => {
        this.updateGoToTop(highlightsBodyRef);
        this.fetchMoreHighlights(highlightsBodyRef);
      };
      highlightsBodyRef.addEventListener('scroll', this.scrollHandler);
      typesetMath(highlightsBodyRef, assertWindow());
    }
  }

  public componentWillUnmount() {
    const highlightsBodyRef = this.myHighlightsBodyRef.current;

    if (this.scrollHandler && isHtmlElement(highlightsBodyRef)) {
      highlightsBodyRef.removeEventListener('scroll', this.scrollHandler);
    }
  }

  public componentDidUpdate(prevProps: ShowMyHighlightsProps) {

    if (!prevProps.summaryIsLoading || !this.myHighlightsBodyRef.current) { return; }

    const {summaryHighlights: prevHighlights} = prevProps;
    const {summaryHighlights: currHighlights} = this.props;

    if (!prevHighlights || !currHighlights) { return; }

    if (!isEqual(lastProp(prevHighlights), lastProp(currHighlights))) {
      this.props.services.promiseCollector.add(allImagesLoaded(this.myHighlightsBodyRef.current));
    }
  }

  public render() {
    return (
      <Styled.ShowMyHighlightsBody
        ref={this.myHighlightsBodyRef}
        data-testid='show-myhighlights-body'
        data-analytics-region='MH popup'
      >
        <Filters printHighlights={this.printHighlights}/>
        <Highlights />
        {this.state.showGoToTop && (
          <Styled.GoToTopWrapper
            onClick={this.scrollToTop}
            data-testid='back-to-top-highlights'
          >
            <Styled.GoToTop>
              <Styled.GoToTopIcon />
            </Styled.GoToTop>
          </Styled.GoToTopWrapper>
        )}
      </Styled.ShowMyHighlightsBody>
    );
  }
}

const connector = connect(
  (state: AppState) => ({
    hasMoreResults: select.hasMoreResults(state),
    summaryHighlights: select.summaryHighlights(state),
    summaryIsLoading: select.summaryIsLoading(state),
  }),
  (dispatch: Dispatch) => ({
    loadMore: () => dispatch(loadMoreSummaryHighlights()),
    printHighlights: () => dispatch(printSummaryHighlights()),
  })
);

export default flow(withServices, connector)(ShowMyHighlights);
