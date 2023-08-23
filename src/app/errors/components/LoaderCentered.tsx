import React from 'react';
import styled from 'styled-components/macro';
import Loader from '../../components/Loader';

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line: variable-name
const LoaderCentered = () => <Wrapper>
  <Loader />
</Wrapper>;

export default LoaderCentered;
