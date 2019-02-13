import styled from 'styled-components';
import MainContent from '../../components/MainContent';
import theme from '../../theme';

export default styled(MainContent)`
  flex: 1;
  margin: 50px;

  @media (max-width: ${theme.breakpoint.mobile}px) {
    min-width: 300px;
    padding: 0;
  }
  @media (min-width: ${theme.breakpoint.mobile + 1}px) {
    min-width: 350px;
    padding: 0 50px;
  }

  .highlight {
    background-color: yellow;
  }

  // these are only here because the cnx-recipes styles are broken
  font-size: 18px;
  font-family: "Noto Sans";

  * {
   overflow: initial;
  }
`;
