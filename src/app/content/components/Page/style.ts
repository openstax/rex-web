import { css } from 'styled-components/macro';
import { wrapperPadding } from '../../../components/Layout';

export default css`
  ${wrapperPadding}
  position: relative;

  @media screen { /* full page width in print */
    flex: 1;
    flex-direction: column;
    display: flex;
    width: 100%;
    justify-content: center;
  }
`;
