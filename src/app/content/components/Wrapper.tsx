import styled from 'styled-components';
import MainContent from '../../components/MainContent';

export default styled(MainContent)`
  display: flex;
  flex-direction: row;

  // these are only here because the cnx-recipes styles are broken
  font-size: 18px;
  font-family: "Noto Sans";

  * {
   overflow: initial;
  }
`;
