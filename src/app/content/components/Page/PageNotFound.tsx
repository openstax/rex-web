import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { OpenSidebarControl } from '../SidebarControl';

// tslint:disable-next-line: variable-name
const PageNotFoundWrapper = styled.div`
  margin: 10rem;
  text-align: center;
  color: ${theme.color.primary.gray.base};
  ${theme.breakpoints.mobile(css`
    margin: 4rem 0 0 0;
  `)}
`;

// tslint:disable-next-line: variable-name
const PageNotFoundTitle = styled.h1`
  font-weight: bold;
  padding: 1rem 0;
  line-height: 1;
`;

// tslint:disable-next-line: variable-name
const PageNotFoundText = styled.div`
  display: flex;
  justify-content: center;
  font-size: 1.6rem;
  line-height: 1.8;

  span {
    margin-right: 0.5rem;
  }
`;

// tslint:disable-next-line: variable-name
const PageNotFound = () => <PageNotFoundWrapper>
  <PageNotFoundTitle>
    <FormattedMessage id='i18n:page-not-found:heading'>
      {(msg) => msg}
    </FormattedMessage>
  </PageNotFoundTitle>
  <PageNotFoundText>
    <span>
      <FormattedMessage id='i18n:page-not-found:text-before-button'>
        {(msg) => msg}
      </FormattedMessage>
    </span>
    <OpenSidebarControl hideMobileText={false}/>
  </PageNotFoundText>
</PageNotFoundWrapper>;

export default PageNotFound;
