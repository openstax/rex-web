import React from 'react';
import { renderToDom } from '../../../test/reactutils';
import ContentWarning from './ContentWarning';
import { useServices } from '../../context/Services';
import { OSWebBook } from '../../../gateways/createOSWebLoader';
import { BookWithOSWebData } from '../types';
import { act } from 'react-dom/test-utils';
import TestContainer from '../../../test/TestContainer';
import ReactTestUtils from 'react-dom/test-utils';

const dummyBook = ({
  id: 'dummy-id',
} as unknown) as BookWithOSWebData;

const dummyBookInfo = ({
  content_warning_text: 'some warning text',
  id: 72,
} as unknown) as OSWebBook;

const services = {
  osWebLoader: {
    getBookFromId: jest.fn(() => Promise.resolve(dummyBookInfo)),
  },
};

jest.mock('../../context/Services', () => ({
  ...jest.requireActual('../../context/Services'),
  useServices: jest.fn(),
}));

(useServices as jest.Mock).mockReturnValue(services);

describe('ContentWarning', () => {
  it('renders warning modal', async() => {
    renderToDom(<TestContainer><ContentWarning book={dummyBook} /></TestContainer>);

    expect(services.osWebLoader.getBookFromId).toBeCalledWith(dummyBook.id);
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    const root = document?.body;
    const b = root?.querySelector('button');

    expect(b).toBeTruthy();
    // Exercises the when-focus-is-already-in-the-modal branch
    b!.focus();
    act(() => ReactTestUtils.Simulate.click(b!));
    expect(root?.querySelector('button')).toBeFalsy();
  });
});
