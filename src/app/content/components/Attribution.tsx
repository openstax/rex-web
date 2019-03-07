import { Element } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import scrollTo from 'scroll-to-element';
import styled from 'styled-components';
import { bodyCopyRegularStyle, linkColor, linkStyle } from '../../components/Typography';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import { assertString } from '../../utils';
import * as select from '../selectors';
import { Book, Page } from '../types';
import { findDefaultBookPage, getBookPageUrlAndParams } from '../utils';
import { contentTextStyle } from './Page';

if (typeof(document) !== 'undefined') {
  import('details-polyfill');
}

const slimBreak = '48em';

// tslint:disable-next-line:variable-name
const Summary = styled.summary`
  ${contentTextStyle}
  color: ${linkColor};

  > span {
    ${bodyCopyRegularStyle}
    ${linkStyle}
  }
`;

// tslint:disable-next-line:variable-name
const Content = styled.div`
  ${contentTextStyle}
`;

// tslint:disable-next-line:variable-name
const Details = styled.details`
  ${bodyCopyRegularStyle}
  box-shadow: 0 0 0.2rem 0.2rem rgba(0, 0, 0, 0.1);
  margin: 2rem 0 0 0;

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

class Attribution extends Component<Props> {
  public container: Element | undefined | null;
  private toggleHandler: undefined | (() => void);

  public componentDidMount() {
    const {container} = this;

    if (!container) {
      return;
    }

    this.toggleHandler = () => scrollTo(container);
    container.addEventListener('toggle', this.toggleHandler);
  }

  public componentWillUnmount() {
    if (!this.container || !this.toggleHandler) {
      return;
    }
    this.container.removeEventListener('toggle', this.toggleHandler);
  }

  public render() {
    const {book} = this.props;

    return <Details ref={(ref: any) => this.container = ref}>
      <Summary>
        <FormattedMessage id='i18n:attribution:toggle'>
          {(msg) => <span>{msg}</span>}
        </FormattedMessage>
      </Summary>
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
    const bookPublishDate = new Date(book.publish_date);

    // date is initialized as UTC, conversion to local time can change the date.
    // this compensates
    bookPublishDate.setMinutes(bookPublishDate.getMinutes() + bookPublishDate.getTimezoneOffset());

    return {
      bookAuthors: book.authors.map(({value: {name}}) => name).join(', '),
      bookLicenseName: book.license.name,
      bookLicenseVersion: book.license.version,
      bookPublishDate,
      bookTitle: book.title,
      currentPath: this.props.currentPath,
      introPageUrl,
    };
  }
}

export default connect(
  (state: AppState) => ({
    ...select.bookAndPage(state),
    currentPath: selectNavigation.pathname(state),
  })
)(Attribution);
