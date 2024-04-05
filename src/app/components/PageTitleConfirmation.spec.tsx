import React from 'react';
import { renderToDom } from '../../test/reactutils';
import { act } from 'react-dom/test-utils';
import announcePageTitle, {
  PageTitleConfirmation
} from './PageTitleConfirmation';

describe('On scroll', () => {
  it('doesn\'t throw when it has no children', async() => {
    const component = renderToDom(<PageTitleConfirmation className='any' />);

    act(() => announcePageTitle('something'));
    expect(component.node.textContent).toBe('Loaded page "something"');
    component.unmount();
  });
});
