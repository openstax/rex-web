import React from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Button, { ButtonGroup } from '../../components/Button';
import { Dispatch } from '../../types';
import { assertString } from '../../utils';
import { dismissNotification } from '../actions';
import { AppMessageNotification } from '../types';
import { Body, Group, Header, P } from './Card';

// tslint:disable-next-line:variable-name
const AppMessage = ({dismiss}: {dismiss: () => void}) => <Body>
  <Group>
    <FormattedMessage id='i18n:notification:cookies:header'>
      {(txt) => <Header>{txt}</Header>}
    </FormattedMessage>
    <FormattedHTMLMessage id='i18n:notification:cookies:body'>
      {(html) => <P
       dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:notification:cookies:body must return a string')}}
      />}
    </FormattedHTMLMessage>
    <ButtonGroup>
      <FormattedMessage id='i18n:notification:cookies:ok'>
        {(txt) => <Button variant='primary' onClick={dismiss}>{txt}</Button>}
      </FormattedMessage>
    </ButtonGroup>
  </Group>
</Body>;

export default connect(
  () => ({
  }),
  (dispatch: Dispatch, ownProps: {notification: AppMessageNotification}) => ({
    dismiss: () => dispatch(dismissNotification(ownProps.notification)),
  })
)(AppMessage);
