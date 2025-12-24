import React from 'react';
import LoginGate from './LoginGate';
import renderer from 'react-test-renderer';
import { book as archiveBook } from '../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../test/mocks/osWebLoader';
import { formatBookData } from '../utils';
import TestContainer from '../../../test/TestContainer';
import createIntl from '../../messages/createIntl';
import { RawIntlProvider } from 'react-intl';

jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({
    formatMessage: ({ id }: any) => id,
  }),
}));

const dummyBook = {
  ...formatBookData(archiveBook, mockCmsBook),
  require_login_message_text: 'some warning text',
};

describe('LoginGate', () => {
  it('renders when not authenticated', async() => {
    const intl = await createIntl('en');
    const component = renderer.create(<RawIntlProvider value={intl}>
      <TestContainer>
        <LoginGate book={dummyBook}>
        </LoginGate>
      </TestContainer>
    </RawIntlProvider>);

    expect(component.root.findByType('a').props.href).toBe('/accounts/login?r=/');
  });
});