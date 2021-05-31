import React from 'react';
import renderer from 'react-test-renderer';
import createTestStore from '../../test/createTestStore';
import TestContainer from '../../test/TestContainer';
import { locationChange } from '../navigation/actions';
import DynamicContentStyles, { WithStyles } from './DynamicContentStyles';

describe('DynamicContentStyles', () => {
  // tslint:disable-next-line: variable-name
  let Component: React.ComponentType;
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    Component = () => <DynamicContentStyles>
      some text
    </DynamicContentStyles>;
  });

  it('fetches styles', async() => {
    store.dispatch(locationChange({ location: { search: 'content-style=file.css' } } as any));
    const spyFetch = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(async() => ({ text: async() => '.cool { color: red; }' }) as any);

    const componenet = renderer.create(<TestContainer store={store}>
      <Component />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    await renderer.act(async() => {});

    const withStyles = componenet.root.findByType(WithStyles);
    expect(withStyles.props.styles).toEqual('.cool { color: red; }');
    expect(spyFetch).toHaveBeenCalledWith('file.css');
    spyFetch.mockClear();
  });

  it('noops if content-style is not provided', async() => {
    const spyFetch = jest.spyOn(globalThis, 'fetch')
      .mockImplementation(async() => ({ text: async() => '.cool { color: red; }' }) as any);

    renderer.create(<TestContainer store={store}>
      <Component />
    </TestContainer>);

    // tslint:disable-next-line: no-empty
    await renderer.act(() => {});

    expect(spyFetch).not.toHaveBeenCalled();
    spyFetch.mockClear();
  });
});
