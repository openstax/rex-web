import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ActionType } from 'typesafe-actions';
import Button, { ButtonGroup } from '../../components/Button';
import { htmlMessage } from '../../components/htmlMessage';
import { Dispatch } from '../../types';
import { dismissNotification, retiredBookRedirect } from '../actions';
import { Body, Group, Header, P } from './Card';

const Content = htmlMessage('i18n:notification:retired-book:body', P);

const RetiredBookRedirect = ({dismiss, className}:
  {dismiss: () => void, className?: string}) => <Body className={className}>
    <Group>
      <FormattedMessage id='i18n:notification:retired-book:header'>
        {(txt: string) => <Header>{txt}</Header>}
      </FormattedMessage>
      <Content />
      <ButtonGroup>
        <FormattedMessage id='i18n:notification:retired-book:ok'>
          {(txt: string) => <Button variant='primary' onClick={dismiss}>{txt}</Button>}
        </FormattedMessage>
      </ButtonGroup>
    </Group>
  </Body>;

export default connect(
  () => ({
  }),
  (dispatch: Dispatch, ownProps: {notification: ActionType<typeof retiredBookRedirect>}) => ({
    dismiss: () => {
      dispatch(dismissNotification(ownProps.notification));
    },
  })
)(RetiredBookRedirect);
