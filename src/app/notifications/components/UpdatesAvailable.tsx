import { ServiceWorker, ServiceWorkerRegistration } from '@openstax/types/lib.dom';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Sentry from '../../../helpers/Sentry';
import Button, { ButtonGroup } from '../../components/Button';
import { useServices } from '../../context/Services';
import { Body, Group, Header, P } from './Card';

const reload = () => {
  if (typeof(window) !== 'undefined') {
    window.location.reload(true);
  }
};

const handleEventOnce = (sw: ServiceWorkerRegistration | ServiceWorker, event: string, handler: () => void) => {
  const deregisteringHandler = () => {
    sw.removeEventListener(event, deregisteringHandler);
    handler();
  };
  sw.addEventListener(event, deregisteringHandler);
};

const handleStateChangeOnce = (sw: ServiceWorker, state: ServiceWorker['state'], handler: () => void) => {
  const filteringHandler = () => {
    if (sw.state === state) {
      handler();
    }
  };
  handleEventOnce(sw, 'statechange', filteringHandler);
};

const workerNeedsUpdate = (sw: ServiceWorkerRegistration | undefined): sw is ServiceWorkerRegistration => {
  if (!sw) {
    return false;
  }
  if (sw.waiting || sw.installing) {
    return false;
  }

  return true;
};

const awaitInstalled = (sw: ServiceWorkerRegistration, callback: () => void) => () => {
  const {installing} = sw;
  if (installing) {
    handleStateChangeOnce(installing, 'installed', callback);
  } else {
    callback();
  }
};

/*
 * the service worker will update on its own after a refresh, but if we're going to
 * prompt people we want to make sure its ready before the refresh
 */
const useUpdateServiceWorker = (sw: ServiceWorkerRegistration | undefined, callback: () => void) => useEffect(() => {
  if (workerNeedsUpdate(sw)) {
    const handler = awaitInstalled(sw, callback);
    handleEventOnce(sw, 'updatefound', handler);

    sw.update().catch((e) => {
      Sentry.captureException(e);
      callback();
    });
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const doReload = (sw: ServiceWorkerRegistration | undefined) => () => {
  const {waiting} = sw || {waiting:  undefined};

  if (waiting) {
    handleStateChangeOnce(waiting, 'activating', reload);
    waiting.postMessage({type:  'SKIP_WAITING'});
  } else {
    reload();
  }
};

  // tslint:disable-next-line:variable-name
const UpdatesAvailable = ({className}: {className ?: string}) => {
  const sw = useServices().serviceWorker;
  const [readyToReload, setReadyToReload] = useState<boolean>(!workerNeedsUpdate(sw));

  useUpdateServiceWorker(sw, () => setReadyToReload(true));

  if (!readyToReload) {
    return null;
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
        {(txt) => (<Button variant='primary' onClick={doReload(sw)}>{txt}</Button>)}
      </FormattedMessage>
    </ButtonGroup>
  </Body>;
};

export default UpdatesAvailable;
