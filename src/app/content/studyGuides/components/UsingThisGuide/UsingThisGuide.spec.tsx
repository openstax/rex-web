
import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../../test/createTestStore';
import { book as archiveBook } from '../../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../../test/mocks/osWebLoader';
import TestContainer from '../../../../../test/TestContainer';
import { runHooksAsync } from '../../../../../test/utils';
import { Store } from '../../../../types';
import { receiveBook } from '../../../actions';
import { formatBookData } from '../../../utils';
import UsingThisGuideBanner from './UsingThisGuideBanner';
import UsingThisGuideButton from './UsingThisGuideButton';

const book = formatBookData(archiveBook, mockCmsBook);

describe('Using this guide', () => {
  const onclickFn = jest.fn();
  let store: Store;

  beforeEach(() => {
    store = createTestStore();
    store.dispatch(receiveBook(book));
  });

  it('renders using this guide button correctly (when banner closed)', async() => {
    const component = renderer.create(<TestContainer store={store}>
      <UsingThisGuideButton open={false} onClick={onclickFn}/>
    </TestContainer>);

    await runHooksAsync();

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders using this guide button correctly (when banner open)', async() => {
    const component = renderer.create(<TestContainer store={store}>
      <UsingThisGuideButton open={true} onClick={onclickFn}/>
    </TestContainer>);

    await runHooksAsync();

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders using this guide banner correctly', async() => {
    const component = renderer.create(<TestContainer store={store}>
      <UsingThisGuideBanner show={true} onClick={onclickFn}/>
    </TestContainer>);

    await runHooksAsync();

    expect(component.toJSON()).toMatchSnapshot();
  });
});
