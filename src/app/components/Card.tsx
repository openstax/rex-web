import styled from 'styled-components';
import { textStyle } from './Typography/base';

const margin = 3.0;

// tslint:disable-next-line:variable-name
const Card = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  overflow: hidden;
  padding: ${margin}rem;
  width: 30rem;
  ${textStyle};
  background-color: white;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.05), 0 0 4rem rgba(0, 0, 0, 0.08);
  border-radius: 0.5rem;
`;

Card.Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: ${margin * 0.5}rem;
`;

Card.Heading = styled.h1`
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 2.4rem;
  font-weight: bold;
  text-align: center;
`;

Card.Body = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.4rem;
  margin-top: ${margin * 0.5}rem;
  margin-bottom: ${margin * 0.5}rem;

  ${Card.Header} + & { /* stylelint-disable */
    margin-top: 0;
  }
`;

Card.Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export default Card;
