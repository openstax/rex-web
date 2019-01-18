import React, { SFC } from 'react';
import styled from 'styled-components';
import Button, { ButtonGroup } from '../../components/Button';

// tslint:disable-next-line:variable-name
const P = styled.div`
  box-sizing: border-box;
  width: 100%;
`;

// tslint:disable-next-line:variable-name
const Body = styled.div`
  background-color: #fff;
  border: thin solid #d5d5d5;
  box-shadow: 0 1rem 2rem 0 rgba(0, 0, 0, 0.2);
  display: block;
  flex-basis: 100%;
  max-width: 54rem;
  padding-bottom: 0.5rem;

  > ${ButtonGroup}, ${P} {
    padding: .5rem 1rem;
    margin: 0;
  }
`;

// tslint:disable-next-line:variable-name
const Header = styled.div`
  background-color: #f1f1f1;
  margin-bottom: 1.5rem;
  min-height: 1.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  line-height: 2.5rem;
`;

const reload = () => {
  if (typeof(window) !== 'undefined') {
    window.location.reload(true);
  }
};

// tslint:disable-next-line:variable-name
const UpdatesAvailable: SFC = () => <Body>
  <Header>Updates Available</Header>
  <P>This page needs to be reloaded.</P>
  <ButtonGroup>
    <Button variant='primary' onClick={reload}>Reload</Button>
  </ButtonGroup>
</Body>;

export default UpdatesAvailable;
