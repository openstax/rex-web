import { Element } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import scrollTo from 'scroll-to-element';
import styled from 'styled-components';
import { bodyCopyRegularStyle } from '../../components/Typography';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import { assertString } from '../../utils';
import * as select from '../selectors';
import { Book, Page } from '../types';
import { findDefaultBookPage, getBookPageUrlAndParams } from '../utils';
import { maxTextWidth } from './Page';

if (typeof(document) !== 'undefined') {
  import('details-polyfill');
}

const slimBreak = '48em';

// tslint:disable-next-line:variable-name
const Summary = styled.summary`
  line-height: 2.5rem;
  font-size: 1.6rem;
  color: #027EB5;
`;

// tslint:disable-next-line:variable-name
const Content = styled.div`
`;

// tslint:disable-next-line:variable-name
const Details = styled.details`
  ${bodyCopyRegularStyle}
  background: white;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
  margin: 2rem 0 0 0;

  > ${Summary}, ${Content} {
    padding: 0 1.6rem
    max-width: ${maxTextWidth}rem;
    margin: 0 auto;
  }

  @media (max-width: ${slimBreak}) {
    min-height: 4rem;
    padding: 0.8rem 0 0 0;

    > ${Summary} {
      margin-bottom: 0.8rem;
    }
  }

  @media (min-width: ${slimBreak}) {
    min-height: 6rem;
    padding: 1.8rem 0 0 0;

    > ${Summary} {
      margin-bottom: 1.8rem;
    }
  }

  li {
    margin-bottom: 1rem;
    overflow: visible;
  }
`;

interface Props {
  currentPath: string;
  book: Book | undefined;
  page: Page | undefined;
}

// tslint:disable-next-line:variable-name
class Attribution extends Component<Props> {
  public container: Element | undefined | null;

  public componentDidMount() {
    if (!this.container) {
      return;
    }
    this.container.addEventListener('toggle', this.toggleHandler);
  }

  public componentWillUnmount() {
    if (!this.container) {
      return;
    }
    this.container.removeEventListener('toggle', this.toggleHandler);
  }

  public render() {
    const {book} = this.props;

    return <Details ref={(ref: any) => this.container = ref}>
      <FormattedMessage id='i18n:attribution:toggle'>
        {(msg) => <Summary>{msg}</Summary>}
      </FormattedMessage>
      {book && <FormattedHTMLMessage id='i18n:attribution:text' values={this.getValues(book)}>
        {(html) => <Content
          dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:attribution:text must return a string')}}
        ></Content>}
      </FormattedHTMLMessage>}
    </Details>;
  }

  private getValues = (book: Book) => {
    const introPage = findDefaultBookPage(book);
    const introPageUrl = getBookPageUrlAndParams(book, introPage).url;

    return {
      bookAuthors: book.authors.map(({value: {name}}) => name).join(', '),
      bookLicenseName: book.license.name,
      bookLicenseVersion: book.license.version,
      bookPublishDate: new Date(book.publishDate),
      bookTitle: book.title,
      currentPath: this.props.currentPath,
      introPageUrl,
    };
  }

  private toggleHandler = () => {
    if (!this.container) {
      return;
    }

    scrollTo(this.container);
  }
}

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    currentPath: selectNavigation.pathname(state),
    page: select.page(state),
  })
)(Attribution);
