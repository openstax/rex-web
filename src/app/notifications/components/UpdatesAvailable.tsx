import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button, { ButtonGroup } from '../../components/Button';
import theme from '../../theme';
import { inlineDisplayBreak } from '../theme';

// tslint:disable-next-line:variable-name
const Group = styled.div`
  width: 100%;

  @media (max-width: ${inlineDisplayBreak}) {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

// tslint:disable-next-line:variable-name
const P = styled.p`
  font-size: 1.5rem;
  margin: 0;

  @media (max-width: ${inlineDisplayBreak}) {
    padding: 0 1rem;
  }
  @media (min-width: ${inlineDisplayBreak}) {
    padding: 1rem;
  }
`;

// tslint:disable-next-line:variable-name
const Body = styled.div`
  background-color: #fff;
  border-style: solid;
  border-color: #d5d5d5;
  display: flex;
  flex-basis: 100%;

  @media (max-width: ${inlineDisplayBreak}) {
    border-width: 0 0 thin 0;
    flex-direction: row;
  }
  @media (min-width: ${inlineDisplayBreak}) {
    margin: 0.5rem;
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

  @media (max-width: ${inlineDisplayBreak}) {
    line-height: 1rem;
  }
  @media (min-width: ${inlineDisplayBreak}) {
    background-color: ${theme.color.neutral.darker};
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
