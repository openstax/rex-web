import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import Card from '../../components/Card';
import { ExclamationTriangle } from 'styled-icons/fa-solid/ExclamationTriangle';
import theme from '../../theme';

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
  className?: String,
  footer?: JSX.Element,
}

// tslint:disable-next-line:variable-name
const ErrorCard: React.SFC<Props> = ({
  error, className, footer,
}) => {

  return (
    <Card className={className}>
      <Card.Header>
        <FormattedMessage id='i18n:error:boundary:heading'>
          {(message) => (
            <Card.Heading>
              <ExclamationTriangle height='45px' color='red' /> {message}
            </Card.Heading>
          )}
        </FormattedMessage>
      </Card.Header>
      <Card.Body>
        <FormattedMessage id='i18n:error:boundary:body'>
          {(body) => (<div>{body}</div>)}
        </FormattedMessage>
        <ErrorPanel>
          {error.toString()}
        </ErrorPanel>
        <FormattedMessage id='i18n:error:boundary:action'>
          {(action) => (<p>{action}</p>)}
        </FormattedMessage>
      </Card.Body>
      {footer}
    </Card>
  )
};


export default ErrorCard;
