import React from 'react';
import ReactDOM from 'react-dom';
import { RawIntlProvider } from 'react-intl';
import uuid from 'uuid/v4';
import { AppServices, Dispatch } from '../../../../types';
import { assertDocument, assertNotNull } from '../../../../utils';
import { clearFocusedHighlight, focusHighlight, setAnnotationChangesPending } from '../../actions';
import ConfirmationModal from '../ConfirmationModal';

export default async(services: AppServices, dispatch: Dispatch, focusedHighlight: string) => {
  const document = assertDocument();
  const domNode = document.createElement('div');

  domNode.id = `dialog-${uuid()}`;
  const root = assertNotNull(document.getElementById('root'), 'root element not found');
  root.insertAdjacentElement('afterend', domNode);

  const userChoice: boolean = await new Promise((resolve) => {
    dispatch(clearFocusedHighlight());
    const confirm = () => resolve(true);
    const deny = () => {
      resolve(false);
      dispatch(focusHighlight(focusedHighlight));
      dispatch(setAnnotationChangesPending(true));
    };
    ReactDOM.render(
      <RawIntlProvider value={services.intl}>
        <ConfirmationModal deny={deny} confirm={confirm} />
      </RawIntlProvider>,
      domNode
    );
  });

  ReactDOM.unmountComponentAtNode(domNode);
  assertNotNull(domNode.parentElement, 'parent element not found').removeChild(domNode);

  return userChoice;
};
