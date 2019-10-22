import { css } from 'styled-components/macro';

export default css`
  overflow: visible;

  @media screen { /* full page width in print */
    flex: 1;
    flex-direction: column;
    display: flex;
    width: 100%;
  }
`;
