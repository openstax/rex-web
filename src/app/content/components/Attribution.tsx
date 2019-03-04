import { Element } from '@openstax/types/lib.dom';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import scrollTo from 'scroll-to-element';
import styled from 'styled-components';
import { bodyCopyRegularStyle } from '../../components/Typography';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';
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
const MobileSummary = styled.span`
  @media (min-width: ${slimBreak}) {
    display: none;
  }
`;

// tslint:disable-next-line:variable-name
const DesktopSummary = styled.span`
  @media (max-width: ${slimBreak}) {
    display: none;
  }
`;

// tslint:disable-next-line:variable-name
const Details = styled.details`
  ${bodyCopyRegularStyle}
  background: white;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
  margin: 2rem 0 0 0;

  > ${Summary}, p, ul {
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
    const {book, currentPath} = this.props;
    return <Details ref={(ref: any) => this.container = ref}>
      <Summary>
        <FormattedMessage id='i18n:attribution:toggle:desktop'>
          {(msg) => <DesktopSummary>{msg}</DesktopSummary>}
        </FormattedMessage>
        <FormattedMessage id='i18n:attribution:toggle:mobile'>
          {(msg) => <MobileSummary>{msg}</MobileSummary>}
        </FormattedMessage>
      </Summary>
      <p>
        © Feb 11, 2019 OpenStax. Textbook content produced by OpenStax is licensed
        under a {book && book.license.name} {book && book.license.version} license. Under this license,
        any user of this textbook or the textbook contents herein must provide proper
        attribution as follows:
      </p>
      <ul>
        <li>
          The OpenStax name, OpenStax logo, OpenStax book covers, OpenStax CNX name,
          and OpenStax CNX logo are not subject to the creative commons license and
          may not be reproduced without the prior and express written consent of Rice
          University. For questions regarding this license, please contact support@openstax.org.
        </li>
        <li>
          If you use this textbook as a bibilographic reference, then you should cite it as follows:
          OpenStax {book && book.title}, {book && book.title}. OpenStax CNX. Feb 11, 2019
          https://openstax.org{currentPath}.
        </li>
        <li>
          If you redistribute this textbook in a print format, then you must include on every physical
          page the following attribution: Download fro free at https://openstax.org{currentPath}.
        </li>
        <li>
          If you redistribute part of this textbook, then you must retain in every digital format page
          view (invluding but not limited to EPUB, PDF, and HTML) an on every physically printed page
          the following attribution: Download for free at https://openstax.org{currentPath}.
        </li>
      </ul>
    </Details>;
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
