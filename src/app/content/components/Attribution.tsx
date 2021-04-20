import { HTMLDetailsElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { CollapseIcon, Details, ExpandIcon, Summary } from '../../components/Details';
import { htmlMessage } from '../../components/htmlMessage';
import { bodyCopyRegularStyle, decoratedLinkStyle, textRegularLineHeight } from '../../components/Typography';
import { useServices } from '../../context/Services';
import { scrollTo } from '../../domUtils';
import * as selectNavigation from '../../navigation/selectors';
import theme from '../../theme';
import { AppState } from '../../types';
import { assertNotNull } from '../../utils';
import { hasOSWebData } from '../guards';
import * as select from '../selectors';
import { Book, BookWithOSWebData, Page } from '../types';
import { findDefaultBookPage, getBookPageUrlAndParams } from '../utils';
import { contentTextStyle } from './Page/PageContent';
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

// tslint:disable-next-line:variable-name
const SummaryClosedIcon = styled((props) => <ExpandIcon {...props} />)`
  ${summaryIconStyle}
`;
// tslint:disable-next-line:variable-name
const SummaryOpenIcon = styled((props) => <CollapseIcon {...props} />)`
  ${summaryIconStyle}
`;

// tslint:disable-next-line:variable-name
const AttributionSummary = styled((props) => {
  const message = useIntl().formatMessage({id: 'i18n:attribution:toggle'});

  return <Summary {...props} aria-label={message}>
    <SummaryClosedIcon />
    <SummaryOpenIcon />
    <span>{message}</span>
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

// tslint:disable-next-line:variable-name
const Content = styled.div`
  ${contentTextStyle}

  blockquote {
    margin-left: 0;
  }
`;

// tslint:disable-next-line:variable-name
const AttributionDetails = styled(Details)`
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

// tslint:disable-next-line:variable-name
const AttributionContent = htmlMessage('i18n:attribution:text', Content);

interface Props {
  currentPath: string;
  book: Book | undefined;
  page: Page | undefined;
}

// tslint:disable-next-line: variable-name
const Attribution = (props: Props) => {
  // tslint:disable-next-line: no-console
  console.log('render Attribution');
  const services = useServices();
  const [values, setValues] = React.useState<Record<string, any>>();
  const containerRef = React.useRef<HTMLDetailsElement>();
  const bookIdsWithSpecialAttributionText: {
    [key: string]: {
      copyrightHolder?: string,
      originalMaterialLink?: null | string,
    }
  } = {
    '1b4ee0ce-ee89-44fa-a5e7-a0db9f0c94b1': {
      copyrightHolder: 'The Michelson 20MM Foundation',
    },
    '394a1101-fd8f-4875-84fa-55f15b06ba66': {
      copyrightHolder: 'Texas Education Agency (TEA)',
      originalMaterialLink: 'https://www.texasgateway.org/book/tea-statistics',
    },
    'cce64fde-f448-43b8-ae88-27705cceb0da': {
      copyrightHolder: 'Texas Education Agency (TEA)',
      originalMaterialLink: 'https://www.texasgateway.org/book/tea-physics',
    },
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const toggleHandler = () => container.getAttribute('open') !== null && scrollTo(container);
    container.addEventListener('toggle', toggleHandler);

    return () => {
      if (!container || !toggleHandler) {
        return;
      }
      container.removeEventListener('toggle', toggleHandler);
    };
  }, []);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.removeAttribute('open');
    }
  }, [props.page]);

  // public componentDidUpdate(prevProps: Props) {
  //   if (this.container.current && prevProps.page && prevProps.page !== this.props.page) {
  //     this.container.current.removeAttribute('open');
  //   }
  // }

  React.useEffect(() => {
    const getValues = async(book: BookWithOSWebData) => {
      const introPage = findDefaultBookPage(book);
      const introPageUrl = (await getBookPageUrlAndParams(book, introPage, services.bookConfigLoader)).url;

      assertNotNull(book.publish_date, `BUG: Could not find publication date`);
      const bookPublishDate = new Date(book.publish_date);
      const bookLatestRevision = new Date(book.revised);

      // date is initialized as UTC, conversion to local time can change the date.
      // this compensates
      bookPublishDate.setMinutes(bookPublishDate.getMinutes() + bookPublishDate.getTimezoneOffset());
      bookLatestRevision.setMinutes(bookLatestRevision.getMinutes() + bookLatestRevision.getTimezoneOffset());

      const seniorAuthors = book.authors.filter((author) => author.value.senior_author);

      const authorsToDisplay = seniorAuthors.length > 0
        ? seniorAuthors
        : book.authors.slice(0, 2);

      const result = {
        bookAuthors: authorsToDisplay.map(({value: {name}}) => name).join(', '),
        bookLatestRevision,
        bookLicenseName: book.license.name,
        bookLicenseUrl: book.license.url,
        bookLicenseVersion: book.license.version,
        bookPublishDate,
        bookTitle: book.title,
        copyrightHolder: 'OpenStax',
        currentPath: props.currentPath,
        introPageUrl,
        originalMaterialLink: null,
        ...bookIdsWithSpecialAttributionText[book.id] || {},
      };

      setValues(result);
    };

    if (hasOSWebData(props.book)) {
      getValues(props.book);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.book, props.currentPath, services.bookConfigLoader]);

  return hasOSWebData(props.book) ?
    <AttributionDetails
      ref={containerRef}
      data-testid='attribution-details'
      data-analytics-region='attribution'
    >
      <AttributionSummary />
      <AttributionContent values={values} />
    </AttributionDetails>
    : null;
};

export default connect(
  (state: AppState) => ({
    ...select.bookAndPage(state),
    currentPath: selectNavigation.pathname(state),
  })
)(Attribution);
