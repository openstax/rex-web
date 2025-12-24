import styled from 'styled-components/macro';

const LoaderWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-color: rgba(241, 241, 241, 0.8);

  svg {
    margin-top: -5rem;
  }
`;

export default LoaderWrapper;
