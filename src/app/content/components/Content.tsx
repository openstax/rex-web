import React, { Component, RefObject } from 'react';
import { connect } from 'react-redux';
import scrollTo from '../../../helpers/scrollTo';
import withServices from '../../context/Services';
import { AppServices, AppState } from '../../types';
import * as select from '../selectors';
import { ArchiveContent, State } from '../types';
import Header from './Header';
import Page from './Page';
import SkipToContent from './SkipToContent';
import Wrapper from './Wrapper';

const MAIN_CONTENT_ID = 'main-content';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  loading: boolean;
  services: AppServices;
}

interface ReactState {
  book?: ArchiveContent;
  page?: ArchiveContent;
}

export class ContentComponent extends Component<PropTypes, ReactState> {
  public state: ReactState = {};
  private contentTarget: RefObject<any> = React.createRef();

  constructor(props: PropTypes) {
    super(props);
    this.scrollToTarget = this.scrollToTarget.bind(this);
  }

  public loadBook(props: PropTypes) {
    if (!props.book) {
      return;
    }
    this.props.services.archiveLoader(props.book.shortId).then((book) => this.setState({book}));
  }

  public loadPage(props: PropTypes) {
    if (!props.book || !props.page) {
      return;
    }
    this.props.services
      .archiveLoader(`${props.book.shortId}:${props.page.shortId}`).then((page) => this.setState({page}));
  }

  public componentWillMount() {
    this.loadBook(this.props);
    this.loadPage(this.props);
  }

  public componentWillReceiveProps(props: PropTypes) {
    this.loadBook(props);
    this.loadPage(props);
  }

  public renderSkip = () => {
    return <SkipToContent onClick={this.scrollToTarget} targetId={MAIN_CONTENT_ID}/>;
  }

  public renderHeader = () => {
    const {page, book} = this.props as PropTypes;
    return <div>
      {book && page && <Header>{book.title} / {page.title}</Header>}
    </div>;
  }

  public renderContent = () => {
    const {page} = this.state;
    return page && <Page id={MAIN_CONTENT_ID} ref={this.contentTarget} content={page.content} />;
  }

  public render() {
    if (this.isLoading()) {
      return null;
    }
    return <Wrapper key='content'>
      {this.renderSkip()}
      {this.renderHeader()}
      {this.renderContent()}
    </Wrapper>;
  }

  private scrollToTarget(event: React.MouseEvent<HTMLAnchorElement>) {
    if (window && document) {
      if (this.contentTarget.current) {
        event.preventDefault();
        scrollTo(window, document, this.contentTarget.current);
      }
    } else {
      throw new Error(`BUG: Expected window and document to be defined`);
    }
  }

  private isLoading() {
    return this.props.loading || !this.state.book || !this.state.page;
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    loading: !!select.loadingBook(state) || !!select.loadingPage(state),
    page: select.page(state),
  })
)(withServices(ContentComponent));
