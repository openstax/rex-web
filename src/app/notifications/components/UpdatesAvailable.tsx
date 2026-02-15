import { ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import React, { useEffect, useState } from 'react';
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

const UpdatesAvailable = ({className}: {className?: string}) => {
  const readyPromise = assertWindow().navigator.serviceWorker?.ready;
  const [sw, setSw] = useState<ServiceWorkerRegistration | undefined>(undefined);

  useEffect(() => {
    readyPromise?.then((registration) => {
      // check that the readyPromise hasn't changed
      if (assertWindow().navigator.serviceWorker?.ready === readyPromise) {
        findAndInstallServiceWorkerUpdate(registration, () => setSw(registration));
      }
    });
  }, [readyPromise]);

  // if the readyPromise exists, wait for it before rendering
  // if it doesn't exist, we render anyway and in that case
  // onClick() calls activateSwAndReload(undefined) to reload without waiting
  if (assertWindow().navigator.serviceWorker && !sw) {
    return null;
  }

  return <Body className={className}>
    <Group>
      <FormattedMessage id='i18n:notification:update:header'>
        {(txt: string) => (<Header>{txt}</Header>)}
      </FormattedMessage>
      <FormattedMessage id='i18n:notification:update:body'>
        {(txt: string) => (<P>{txt}</P>)}
      </FormattedMessage>
    </Group>
    <ButtonGroup>
      <FormattedMessage id='i18n:notification:update:reload'>
        {(txt: string) => (<Button variant='primary' onClick={activateSwAndReload(sw)}>{txt}</Button>)}
      </FormattedMessage>
    </ButtonGroup>
  </Body>;
};

export default UpdatesAvailable;
