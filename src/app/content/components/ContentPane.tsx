import styled from 'styled-components';
import MainContent from '../../components/MainContent';

export default styled(MainContent)`
  flex: 1;
  margin: 3rem;
  padding: 0 3rem 0 3rem;

  // these are only here because the cnx-recipes styles are broken
  font-size: 18px;
  font-family: "Noto Sans";

  * {
   overflow: initial;
  }
`;
