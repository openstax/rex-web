import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  activateSwAndReload,
  findAndInstallServiceWorkerUpdate,
  serviceWorkerNeedsUpdate
} from '../../../helpers/applicationUpdates';
import Button, { ButtonGroup } from '../../components/Button';
import { useServices } from '../../context/Services';
import { Body, Group, Header, P } from './Card';

/*
 * the service worker will update on its own after a refresh, but if we're going to
 * prompt people we want to make sure its ready before the refresh
 */

// tslint:disable-next-line:variable-name
const UpdatesAvailable = ({className}: {className?: string}) => {
  const sw = useServices().serviceWorker;
  const [readyToReload, setReadyToReload] = useState<boolean>(!serviceWorkerNeedsUpdate(sw));

  useEffect(() => {
    findAndInstallServiceWorkerUpdate(sw, () => setReadyToReload(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {(txt) => (<Button variant='primary' onClick={activateSwAndReload(sw)}>{txt}</Button>)}
      </FormattedMessage>
    </ButtonGroup>
  </Body>;
};

export default UpdatesAvailable;
