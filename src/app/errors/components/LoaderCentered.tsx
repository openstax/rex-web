import React from 'react';
import styled from 'styled-components/macro';
import Loader from '../../components/Loader';

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoaderCentered = () => <Wrapper>
  <Loader />
</Wrapper>;

export default LoaderCentered;
