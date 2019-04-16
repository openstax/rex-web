import { HTMLDetailsElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import scrollTo from 'scroll-to-element';
import { css } from 'styled-components';
import styled from 'styled-components';
import { CaretDown } from 'styled-icons/fa-solid/CaretDown';
import { CaretRight } from 'styled-icons/fa-solid/CaretRight';
import { bodyCopyRegularStyle, decoratedLinkStyle } from '../../components/Typography';
import * as selectNavigation from '../../navigation/selectors';
import theme from '../../theme';
import { AppState } from '../../types';
import { assertString } from '../../utils';
import * as select from '../selectors';
import { Book, Page } from '../types';
import { findDefaultBookPage, getBookPageUrlAndParams } from '../utils';
import { bookBannerDesktopMiniHeight, toolbarDesktopHeight } from './constants';
import { contentTextStyle } from './Page';
import { wrapperPadding } from './Wrapper';

if (typeof(document) !== 'undefined') {
  import('details-polyfill');
}

const summaryIconStyle = css`
  height: 1.5rem;
  width: 1.5rem;
`;
// tslint:disable-next-line:variable-name
const SummaryClosedIcon = styled(CaretRight)`
  ${summaryIconStyle}
`;
// tslint:disable-next-line:variable-name
const SummaryOpenIcon = styled(CaretDown)`
  ${summaryIconStyle}
`;

// tslint:disable-next-line:variable-name
const Summary = styled.summary`
  ${contentTextStyle}
  font-weight: 500;
  list-style: none;

  ::-webkit-details-marker {
    display: none;
  }

  &,
  span {
    ${bodyCopyRegularStyle}
    ${decoratedLinkStyle}
  }
`;

// tslint:disable-next-line:variable-name
const Content = styled.div`
  ${contentTextStyle}

  blockquote {
    margin-left: 0;
  }
`;

// tslint:disable-next-line:variable-name
const Details = styled.details`
  ${bodyCopyRegularStyle}
  box-shadow: 0 -1rem 1rem -1rem rgba(0, 0, 0, 0.1);
  margin: 2rem 0 0 0;
  min-height: 6rem;
  ${wrapperPadding}
  padding-top: 1.8rem;

  > ${Summary} {
    margin-bottom: 1.8rem;
  }

  &[open] ${SummaryClosedIcon} {
    display: none;
  }

  &:not([open]) ${SummaryOpenIcon} {
    display: none;
  }

  ${theme.breakpoints.mobile(css`
    min-height: 4rem;
    padding-top: 0.8rem;

    > ${Summary} {
      margin-bottom: 0.8rem;
    }
  `)}

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
  public container = React.createRef<HTMLDetailsElement>();
  private toggleHandler: undefined | (() => void);

  public componentDidMount() {
    const container = this.container.current;

    if (!container) {
      return;
    }

    const offset = -1 * (bookBannerDesktopMiniHeight + toolbarDesktopHeight) * 10;
    this.toggleHandler = () => container.getAttribute('open') !== null && scrollTo(container, {offset});
    container.addEventListener('toggle', this.toggleHandler);
  }

  public componentWillUnmount() {
    if (!this.container.current || !this.toggleHandler) {
      return;
    }
    this.container.current.removeEventListener('toggle', this.toggleHandler);
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.container.current && prevProps.page && prevProps.page !== this.props.page) {
      this.container.current.removeAttribute('open');
    }
  }

  public render() {
    const {book} = this.props;

    return <Details ref={this.container}>
      <FormattedMessage id='i18n:attribution:toggle'>
        {(msg) => <Summary>
          <SummaryClosedIcon />
          <SummaryOpenIcon />
          <span>{msg}</span>
        </Summary>}
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
