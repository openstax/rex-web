import styled from 'styled-components/macro';
import { wrapperPadding } from '../../../components/Layout';

export default styled.div`
  @media screen {
    ${wrapperPadding}
    max-width: 100vw;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :focus-within {
    overflow: visible;
  }
`;
