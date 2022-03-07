import { ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  activateSwAndReload,
  findAndInstallServiceWorkerUpdate,
} from '../../../helpers/applicationUpdates';
import Button, { ButtonGroup } from '../../components/Button';
import { assertWindow } from '../../utils';
import { Body, Group, Header, P } from './Card';

/*
 * the service worker will update on its own after a refresh, but if we're going to
 * prompt people we want to make sure its ready before the refresh
 */

// tslint:disable-next-line:variable-name
const UpdatesAvailable = ({className}: {className?: string}) => {
  const serviceWorkerContainer = assertWindow().navigator.serviceWorker;
  const [sw, setSw] = useState<ServiceWorkerRegistration | undefined>(undefined);

  if (serviceWorkerContainer) {
    serviceWorkerContainer.ready.then((registration) => {
      findAndInstallServiceWorkerUpdate(registration, () => setSw(registration));
    });

    if (!sw) {
      return null;
    }
  }

  return <Body className={className}>
    <Group>
      <FormattedMessage id='i18n:notification:update:header'>
        {(txt) => (<Header>{txt}</Header>)}
      </FormattedMessage>
      <FormattedMessage id='i18n:notification:update:body'>
        {(txt) => (<P>{txt}</P>)}
      </FormattedMessage>
    </Group>
    <ButtonGroup>
      <FormattedMessage id='i18n:notification:update:reload'>
        {(txt) => (<Button variant='primary' onClick={activateSwAndReload(sw)}>{txt}</Button>)}
      </FormattedMessage>
    </ButtonGroup>
  </Body>;
};

export default UpdatesAvailable;
