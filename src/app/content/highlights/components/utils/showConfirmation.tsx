import React from 'react';
import ReactDOM from 'react-dom';
import MessageProvider from '../../../../MessageProvider';
import { assertDocument, assertNotNull } from '../../../../utils';
import DiscardModal from '../DiscardModal';

export default async() => {
    const document = assertDocument();
    const domNode = document.createElement('div');

    domNode.id = 'portal';
    const root = assertNotNull(document.getElementById('root'), 'root element not found');
    root.insertAdjacentElement('afterend', domNode);

    const userChoice: boolean = await new Promise((resolve) => {
        const onAnswer = (answer: boolean) => resolve(answer);
        ReactDOM.render(
            <MessageProvider>
                <DiscardModal onAnswer={onAnswer}/>
            </MessageProvider>,
            domNode
        );
    });

    ReactDOM.unmountComponentAtNode(domNode);
    assertNotNull(domNode.parentElement, 'parent element not found').removeChild(domNode);

    return userChoice;
};