import React from 'react';
import LoginGate from './LoginGate';
import renderer from 'react-test-renderer';
import { book as archiveBook } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { formatBookData } from '../utils';
import TestContainer from '../../../test/TestContainer';

const dummyBook = {
  ...formatBookData(archiveBook, mockCmsBook),
  require_login_message_text: 'some warning text',
};

describe('LoginGate', () => {
  it('renders when not authenticated', async() => {
    const component = renderer.create(
      <TestContainer>
        <LoginGate book={dummyBook}>
        </LoginGate>
      </TestContainer>
    );

    expect(component.root.findByType('a').props.href).toBe('/accounts/login?r=/');
  });
});