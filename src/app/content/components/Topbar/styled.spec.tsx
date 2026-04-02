import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import {
  MenuButton,
  SearchButton,
  CloseButton,
  CloseButtonNew,
  SearchInput,
  TextResizerChangeButton,
} from './styled';

describe('Topbar styled components transient prop filtering', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('MenuButton filters out transient props starting with $', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <MenuButton
            type="button"
            onClick={jest.fn()}
            {...({ $transientProp: 'should-not-render' } as any)}
            data-testid="menu-button"
          />
        </MessageProvider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toBeTruthy();

    // Navigate to the actual button element in the tree
    const button = component.root.findByType('button');

    // Verify standard props are present
    expect(button.props['data-testid']).toBe('menu-button');
    expect(button.props.type).toBe('button');
    expect(button.props.onClick).toBeDefined();

    // Verify transient prop was filtered out
    expect(button.props['$transientProp']).toBeUndefined();
  });

  it('SearchButton filters out transient props starting with $', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchButton
            desktop
            colorSchema="blue"
            onClick={jest.fn()}
            {...({ $transientProp: 'should-not-render' } as any)}
            data-testid="search-button"
          />
        </MessageProvider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toBeTruthy();

    const button = component.root.findByType('button');

    // Verify standard props are present
    expect(button.props['data-testid']).toBe('search-button');
    expect(button.props.onClick).toBeDefined();

    // Verify transient prop was filtered out
    expect(button.props['$transientProp']).toBeUndefined();
  });

  it('CloseButton filters out transient props starting with $', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <CloseButton
            desktop
            formSubmitted={false}
            onClick={jest.fn()}
            {...({ $transientProp: 'should-not-render' } as any)}
            data-testid="close-button"
          />
        </MessageProvider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toBeTruthy();

    const button = component.root.findByType('button');

    // Verify standard props are present
    expect(button.props['data-testid']).toBe('close-button');
    expect(button.props.onClick).toBeDefined();

    // Verify transient prop was filtered out
    expect(button.props['$transientProp']).toBeUndefined();
  });

  it('CloseButtonNew filters out transient props starting with $', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <CloseButtonNew
            desktop
            formSubmitted={false}
            onClick={jest.fn()}
            {...({ $transientProp: 'should-not-render' } as any)}
            data-testid="close-button-new"
          >
            Close
          </CloseButtonNew>
        </MessageProvider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toBeTruthy();

    const button = component.root.findByType('button');

    // Verify standard props are present
    expect(button.props['data-testid']).toBe('close-button-new');
    expect(button.props.onClick).toBeDefined();
    expect(button.props.children).toBe('Close');

    // Verify transient prop was filtered out
    expect(button.props['$transientProp']).toBeUndefined();
  });

  it('SearchInput filters out transient props starting with $', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <SearchInput
            desktop
            type="text"
            value="test"
            onChange={jest.fn()}
            {...({ $transientProp: 'should-not-render' } as any)}
            data-testid="search-input"
          />
        </MessageProvider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toBeTruthy();

    const input = component.root.findByType('input');

    // Verify standard props are present
    expect(input.props['data-testid']).toBe('search-input');
    expect(input.props.type).toBe('text');
    expect(input.props.value).toBe('test');
    expect(input.props.onChange).toBeDefined();

    // Verify transient prop was filtered out
    expect(input.props['$transientProp']).toBeUndefined();
  });

  it('TextResizerChangeButton filters out transient props starting with $', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <TextResizerChangeButton
            ariaLabelId="test-aria-label"
            onClick={jest.fn()}
            {...({ $transientProp: 'should-not-render' } as any)}
            data-testid="resizer-button"
          >
            Change
          </TextResizerChangeButton>
        </MessageProvider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toBeTruthy();

    const button = component.root.findByType('button');

    // Verify standard props are present
    expect(button.props['data-testid']).toBe('resizer-button');
    expect(button.props.onClick).toBeDefined();
    expect(button.props.children).toBe('Change');

    // Verify transient prop was filtered out
    expect(button.props['$transientProp']).toBeUndefined();
  });

  it('Components pass through non-transient props correctly', () => {
    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <MenuButton
            type="button"
            onClick={jest.fn()}
            {...({ 'data-analytics': 'menu-click', regularProp: 'value' } as any)}
          />
        </MessageProvider>
      </Provider>
    );

    const tree = component.toJSON();
    expect(tree).toBeTruthy();

    const button = component.root.findByType('button');

    // Non-transient props should be passed through
    expect(button.props['data-analytics']).toBe('menu-click');
    expect(button.props.regularProp).toBe('value');
    expect(button.props.type).toBe('button');
    expect(button.props.onClick).toBeDefined();
  });

  it('safeProps reduce function covers both branches', () => {
    // This test specifically ensures that BOTH the if branch (when key doesn't start with $)
    // AND the implicit else branch (when key starts with $) are executed during the reduce operation.
    // This satisfies code coverage requirements for the transient prop filtering logic.

    const component = renderer.create(
      <Provider store={store}>
        <MessageProvider>
          <MenuButton
            type="button"
            onClick={jest.fn()}
            // Mix of regular props (covered by if branch) and transient props (covered by else branch)
            {...({
              'data-regular-prop': 'should-pass-through',
              $transientProp: 'should-be-filtered',
              $anotherTransientProp: 'also-filtered',
            } as any)}
          />
        </MessageProvider>
      </Provider>
    );

    const button = component.root.findByType('button');

    // Verify regular prop passed through (if branch executed)
    expect(button.props['data-regular-prop']).toBe('should-pass-through');

    // Verify transient props were filtered out (else branch executed)
    expect(button.props['$transientProp']).toBeUndefined();
    expect(button.props['$anotherTransientProp']).toBeUndefined();
  });
});
