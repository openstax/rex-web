import { HTMLDetailsElement } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import styled, { AnyStyledComponent,  css } from 'styled-components/macro';
import { CollapseIcon, Details, ExpandIcon, Summary } from '../../components/Details';
import { htmlMessage } from '../../components/htmlMessage';
import { bodyCopyRegularStyle, decoratedLinkStyle, textRegularLineHeight } from '../../components/Typography';
import { scrollTo } from '../../domUtils';
import theme from '../../theme';
import { AppState } from '../../types';
import { assertNotNull } from '../../utils';
import { hasOSWebData } from '../guards';
import * as select from '../selectors';
import { Book, BookWithOSWebData, Page } from '../types';
import { findDefaultBookPage, getBookPageUrlAndParams } from '../utils';
import { splitTitleParts } from '../utils/archiveTreeUtils';
import { contentTextStyle } from './Page/PageContent';
import { bookIdsWithSpecialAttributionText, compensateForUTC, getAuthors, getPublishDate } from './utils/attributionValues';
import { disablePrint } from './utils/disablePrint';
import { wrapperPadding } from './Wrapper';

const detailsMarginTop = 3;
const desktopSpacing = 1.8;
const mobileSpacing = 0.8;
export const desktopAttributionHeight = detailsMarginTop + textRegularLineHeight + desktopSpacing * 2;
export const mobileAttributionHeight = detailsMarginTop + textRegularLineHeight + mobileSpacing * 2;

const summaryIconStyle = css`
  margin-left: -0.3rem;
`;

const SummaryClosedIcon = styled((props) => <ExpandIcon {...props} />)`
  ${summaryIconStyle}
`;
const SummaryOpenIcon = styled((props) => <CollapseIcon {...props} />)`
  ${summaryIconStyle}
`;

const AttributionSummary = styled((props) => {
  const message = useIntl().formatMessage({id: 'i18n:attribution:toggle'});

  return <Summary {...props} aria-label={message}>
    <SummaryClosedIcon />
    <SummaryOpenIcon />
    <span role="heading" aria-level={2}>{message}</span>
  </Summary>;
})`
  ${contentTextStyle}
  font-weight: 500;
  list-style: none;

  &,
  span {
    ${bodyCopyRegularStyle}
    ${decoratedLinkStyle}
  }
`;

const Content = styled.div`
  ${contentTextStyle}

  blockquote {
    margin-left: 0;
  }
`;

const AttributionDetails = styled(Details as AnyStyledComponent)`
  ${bodyCopyRegularStyle}
  box-shadow: 0 -1rem 1rem -1rem rgba(0, 0, 0, 0.1);
  margin: ${detailsMarginTop}rem 0 0 0;
  min-height: 6rem;
  ${wrapperPadding}
  padding-top: ${desktopSpacing}rem;

  > ${AttributionSummary} {
    margin-bottom: ${desktopSpacing}rem;
  }

  ${theme.breakpoints.mobile(css`
    min-height: 4rem;
    padding-top: ${mobileSpacing}rem;

    > ${Summary} {
      margin-bottom: ${mobileSpacing}rem;
    }
  `)}

  li {
    margin-bottom: 1rem;
    overflow: visible;
  }

  ${disablePrint}
`;

const AttributionContent = htmlMessage('i18n:attribution:text', Content);
const CodeRunnerNote = htmlMessage('i18n:attribution:code-runner', Content);

interface Props {
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

    this.toggleHandler = () => container.getAttribute('open') !== null && scrollTo(container);
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
    const {book, page} = this.props;

    return hasOSWebData(book) && !!page && <AttributionDetails
      ref={this.container}
      data-testid='attribution-details'
      data-analytics-region='attribution'
    >
      <AttributionSummary />
      <AttributionContent values={this.getValues(book, page)} />
      {
        book.slug.includes('python') && <strong><CodeRunnerNote /></strong>
      }
    </AttributionDetails>;
  }

  private getValues = (book: BookWithOSWebData, page: Page) => {
    const introPage = findDefaultBookPage(book);
    const bookWithoutExplicitVersions = {
      ...book,
      loadOptions: {booksConfig: book.loadOptions.booksConfig},
    };

    const [, introTitlePart] = splitTitleParts(introPage.title);
    const [, currentTitlePart] = splitTitleParts(page.title);
    const introPageTitle = `${introTitlePart} - ${book.title} | OpenStax`;
    const introPageUrl = getBookPageUrlAndParams(bookWithoutExplicitVersions, introPage).url;
    const currentPageUrl = getBookPageUrlAndParams(bookWithoutExplicitVersions, page).url;
    const currentPageTitle = `${currentTitlePart} - ${book.title} | OpenStax`;

    assertNotNull(book.publish_date, `BUG: Could not find publication date`);
    const bookPublishDate = getPublishDate(book);
    const bookLatestRevision = new Date(book.revised);

    compensateForUTC(bookLatestRevision);

    const authorsToDisplay = getAuthors(book);

    return {
      bookAuthors: authorsToDisplay.map(({value: {name}}) => name).join(', '),
      bookLatestRevision,
      bookLicenseName: book.license.name,
      bookLicenseUrl: book.license.url,
      bookLicenseVersion: book.license.version,
      bookPublishDate,
      bookTitle: book.title,
      copyrightHolder: 'OpenStax',
      currentPath: currentPageUrl,
      currentPageTitle,
      introPageTitle,
      introPageUrl,
      originalMaterialLink: null,
      ...bookIdsWithSpecialAttributionText[book.id] || {},
    };
  };
}

export default connect(
  (state: AppState) => ({
    ...select.bookAndPage(state),
  })
)(Attribution);
