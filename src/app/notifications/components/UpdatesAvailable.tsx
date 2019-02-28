import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button, { ButtonGroup } from '../../components/Button';
import theme from '../../theme';

// tslint:disable-next-line:variable-name
const Group = styled.div`
  width: 100%;
`;

// tslint:disable-next-line:variable-name
const P = styled.div`
  font-size: 1.5rem;

  @media (max-width: ${theme.breakpoint.mobile}px) {
    padding: 0 1rem;
  }
  @media (min-width: ${theme.breakpoint.mobile + 1}px) {
    padding: 1rem;
  }
`;

// tslint:disable-next-line:variable-name
const Body = styled.div`
  margin: 0.5rem;
  background-color: #fff;
  border-style: solid;
  border-color: #d5d5d5;
  display: flex;
  flex-basis: 100%;

  @media (max-width: ${theme.breakpoint.mobile}px) {
    border-width: 0 0 thin 0;
    flex-direction: row;
  }
  @media (min-width: ${theme.breakpoint.mobile + 1}px) {
    flex-direction: column;
    border-width: thin;
    box-shadow: 0 1rem 2rem 0 rgba(0, 0, 0, 0.2);
    overflow: visible;
  }

  > ${ButtonGroup} {
    padding: 1rem;
    margin: 0;
  }
`;

// tslint:disable-next-line:variable-name
const Header = styled.div`
  padding: 0.5rem 1rem;
  font-size: 1.5rem;
  font-weight: bold;

  @media (max-width: ${theme.breakpoint.mobile}px) {
    line-height: 1rem;
  }
  @media (min-width: ${theme.breakpoint.mobile + 1}px) {
    background-color: #f1f1f1;
    line-height: 4rem;
    margin-bottom: 1rem;
  }
`;

const reload = () => {
  if (typeof(window) !== 'undefined') {
    window.location.reload(true);
  }
};

// tslint:disable-next-line:variable-name
const UpdatesAvailable: SFC = () => <Body>
  <Group>
    <FormattedMessage id='i18n:notification:update:header'>
      {(txt) => (<Header>{txt}</Header>)}
    </FormattedMessage>
    <FormattedMessage id='i18n:notification:update:body'>
      {(txt) => (<P>{txt}</P>)}
    </FormattedMessage>
  </Group>
  <ButtonGroup>
    <FormattedMessage id='i18n:notification:update:reload'>
      {(txt) => (<Button variant='primary' onClick={reload}>{txt}</Button>)}
    </FormattedMessage>
  </ButtonGroup>
</Body>;

export default UpdatesAvailable;
