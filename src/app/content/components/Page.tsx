import { Element, Event } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { typesetMath } from '../../../helpers/mathjax';
import withServices from '../../context/Services';
import { push } from '../../navigation/actions';
import { Dispatch } from '../../types';
import { AppServices, AppState } from '../../types';
import { content } from '../routes';
import * as select from '../selectors';
import { State } from '../types';
import BookStyles from './BookStyles';

interface PropTypes {
  page: State['page'];
  book: State['book'];
  navigate: typeof push;
  references: State['references'];
  services: AppServices;
}

export class PageComponent extends Component<PropTypes> {
  public container: Element | undefined | null;

  public getCleanContent = () => {
    const {book, page, services} = this.props;

    const cachedPage = book && page &&
      services.archiveLoader.book(book.id, book.version).page(page.id).cached()
    ;

    const pageContent = cachedPage ? cachedPage.content : '';

    return this.props.references.reduce((html, reference) =>
      html.replace(reference.match, content.getUrl(reference.params))
    , pageContent)
      .replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '')
      .replace(/<div data-type="document-title">[\s\S]*?<\/div>/g, '')
      .replace(/<cnx-pi.*>[\s\S]*<\/cnx-pi>/g, '');
  }

  public componentDidMount() {
    this.postProcess();
    if (this.container) {
      this.container.addEventListener('click', this.clickListener);
    }
  }

  public componentDidUpdate(prevProps: PropTypes) {
    this.postProcess();
    if (window && prevProps.page !== this.props.page) {
      window.scrollTo(0, 0);
    }
  }

  public componentWillUnmount() {
    if (this.container) {
      this.container.removeEventListener('click', this.clickListener);
    }
  }

  public render() {
    return <BookStyles>
      {(className) => <div className={className}>
        <div data-type='chapter'>
          <div
            data-type='page'
            ref={(ref: any) => this.container = ref}
            dangerouslySetInnerHTML={{ __html: this.getCleanContent()}}
          />
        </div>
      </div>}
    </BookStyles>;
  }

  private clickListener = (e: Event) => {
    if (
      typeof(window) === 'undefined' ||
      typeof(window.MouseEvent) === 'undefined' ||
      typeof(window.Element) === 'undefined' ||
      e.type !== 'click' ||
      !(e instanceof window.MouseEvent) ||
      !(e.target instanceof window.HTMLAnchorElement)
    ) {
      return;
    }

    const {references, navigate} = this.props;
    const url = e.target.getAttribute('href');
    const reference = references.find((search) => content.getUrl(search.params) === url);

    if (reference) {
      e.preventDefault();
      navigate({
        params: reference.params,
        route: content,
        state: reference.state,
      });
    }
  }
  private postProcess() {
    if (this.container && typeof(window) !== 'undefined') {
      typesetMath(this.container, window);
    }
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    page: select.page(state),
    references: select.contentReferences(state),
  }),
  (dispatch: Dispatch): {navigate: typeof push} => ({
    navigate: (...args) => dispatch(push(...args)),
  })
)(withServices(PageComponent));
