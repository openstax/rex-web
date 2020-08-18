import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { SidebarControl } from '../Toolbar/styled';

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
`;

// tslint:disable-next-line: variable-name
const PageNotFoundText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.6rem;
  line-height: 1.8;
`;

// tslint:disable-next-line: variable-name
export const ToCButton = styled(SidebarControl)`
  margin-left: 0.5rem !important; /* Important because this style is overriden by #main-content button */
`;

// tslint:disable-next-line: variable-name
const TextMessage = styled.span`
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line: variable-name
const PageNotFound = () => <PageNotFoundWrapper>
  <PageNotFoundTitle>
    <FormattedMessage id='i18n:page-not-found:heading'>
      {(msg: string) => msg}
    </FormattedMessage>
  </PageNotFoundTitle>
  <PageNotFoundText>
    <TextMessage>
      <FormattedMessage id='i18n:page-not-found:text-before-button'>
        {(msg: string) => msg}
      </FormattedMessage>
      <ToCButton />
    </TextMessage>
  </PageNotFoundText>
</PageNotFoundWrapper>;

export default PageNotFound;
