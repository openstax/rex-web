import React, { SFC } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import Button, { ButtonGroup } from '../../components/Button';
import { assertString } from '../../utils';
import { Body, Group, Header, P } from './Card';

// tslint:disable-next-line:variable-name
const UpdatesAvailable: SFC = () => <Body>
  <Group>
    <FormattedMessage id='i18n:notification:cookies:header'>
      {(txt) => <Header>{txt}</Header>}
    </FormattedMessage>
    <FormattedHTMLMessage id='i18n:notification:cookies:body'>
      {(html) => <P
       dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:notification:cookies:body must return a string')}}
      />}
    </FormattedHTMLMessage>
  </Group>
  <ButtonGroup>
    <FormattedMessage id='i18n:notification:cookies:ok'>
      {(txt) => <Button variant='primary'>{txt}</Button>}
    </FormattedMessage>
  </ButtonGroup>
</Body>;

export default UpdatesAvailable;
