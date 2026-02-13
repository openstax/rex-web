import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { StyledOpenTOCControl } from '../SidebarControl';

const PageNotFoundWrapper = styled.div`
  margin: 10rem;
  text-align: center;
  color: ${theme.color.primary.gray.base};
  ${theme.breakpoints.mobile(css`
    margin: 4rem 0 0 0;
  `)}
`;

const PageNotFoundTitle = styled.h1`
  font-weight: bold;
  padding: 1rem 0;
  line-height: 1;
`;

const PageNotFoundText = styled.div`
  display: flex;
  justify-content: center;
  font-size: 1.6rem;
  line-height: 1.8;

  span {
    margin-right: 0.5rem;
  }
`;

const PageNotFound = () => <PageNotFoundWrapper>
  <PageNotFoundTitle>
    <FormattedMessage id='i18n:page-not-found:heading'>
      {(msg: string) => msg}
    </FormattedMessage>
  </PageNotFoundTitle>
  <PageNotFoundText>
    <span>
      <FormattedMessage id='i18n:page-not-found:text-before-button'>
        {(msg: string) => msg}
      </FormattedMessage>
    </span>
    <StyledOpenTOCControl />
  </PageNotFoundText>
</PageNotFoundWrapper>;

export default PageNotFound;
