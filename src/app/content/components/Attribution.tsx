import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { bodyCopyRegularStyle } from '../../components/Typography';
import * as selectNavigation from '../../navigation/selectors';
import { AppState } from '../../types';
import * as select from '../selectors';
import { Book, Page } from '../types';

// tslint:disable-next-line:variable-name
const Wrapper = styled.div`
  background: white;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
  margin: 0;
  min-height: 6rem;
  padding: 1.8rem 13.5rem 0 13.5rem;
`;

// tslint:disable-next-line:variable-name
const Details = styled.details`
  ${bodyCopyRegularStyle}
  max-width: 1170px;
  margin: 0 auto;
  overflow: visible;

  li {
    margin-bottom: 1rem;
    overflow: visible;
  }
`;

// tslint:disable-next-line:variable-name
const Summary = styled.summary`
  line-height: 2.5rem;
  font-size: 1.6rem;
  color: #027EB5;
  margin-bottom: 1.7rem;
`;

interface Props {
  currentPath: string;
  book: Book | undefined;
  page: Page | undefined;
}

// tslint:disable-next-line:variable-name
const Attribution: React.SFC<Props> = ({book, currentPath}) => <Wrapper>
  <Details>
    <Summary>
      How to Reuse & Attribute This Content
    </Summary>

    © Feb 11, 2019 OpenStax. Textbook content produced by OpenStax is licensed
    under a {book && book.license.name} {book && book.license.version} license. Under this license,
    any user of this textbook or the textbook contents herein must provide proper
    attribution as follows:

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
  </Details>
</Wrapper>;

export default connect(
  (state: AppState) => ({
    book: select.book(state),
    currentPath: selectNavigation.pathname(state),
    page: select.page(state),
  })
)(Attribution);
