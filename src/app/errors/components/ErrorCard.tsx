import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { ExclamationTriangle } from 'styled-icons/fa-solid/ExclamationTriangle';
import { textStyle } from '../../components/Typography/base';
import theme from '../../theme';

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

// tslint:disable-next-line:variable-name
const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: ${margin * 0.5}rem;
`;

// tslint:disable-next-line:variable-name
const Heading = styled.h1`
  display: flex;
  align-items: center;
  margin: 0;
  font-size: 2.4rem;
  font-weight: bold;
  text-align: center;
`;

// tslint:disable-next-line:variable-name
const Body = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 1.4rem;
  margin-top: ${margin * 0.5}rem;
  margin-bottom: ${margin * 0.5}rem;

  ${Card.Header} + & { /* stylelint-disable */
  margin-top: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// tslint:disable-next-line:variable-name
const ErrorPanel = styled.div`
  color: white;
  padding: 1rem;
  margin-top: 2rem;
  font-size: 1.2rem;
  background-color: ${theme.color.secondary.lightGray.base};
`;

interface Props {
  error: Error;
  className?: string;
  footer?: JSX.Element;
}

// tslint:disable-next-line:variable-name
const ErrorCard: React.SFC<Props> = ({
  error, className, footer,
}) => {

  return (
    <Card className={className}>
      <Header>
        <FormattedMessage id='i18n:error:boundary:heading'>
          {(message) => (
            <Heading>
              <ExclamationTriangle height='45px' color='red' /> {message}
            </Heading>
          )}
        </FormattedMessage>
      </Header>
      <Body>
        <FormattedMessage id='i18n:error:boundary:body'>
          {(body) => (<div>{body}</div>)}
        </FormattedMessage>
        <ErrorPanel>
          {error.toString()}
        </ErrorPanel>
        <FormattedMessage id='i18n:error:boundary:action'>
          {(action) => (<p>{action}</p>)}
        </FormattedMessage>
      </Body>
      {footer}
    </Card>
  );
};

export default ErrorCard;
