import React from 'react';
import renderer from 'react-test-renderer';
import OnScroll from './OnScroll';

describe('On scroll', () => {

  it('doesn\'t throw when it has no children', async() => {
    const render = () => { renderer.create( <OnScroll /> ); };

    expect(() => render()).not.toThrow();
  });

  it('registers and unregisters callback on mount/unmount', () => {
    const callback = jest.fn();
    const addSpy = jest.spyOn(document!, 'addEventListener');
    const removeSpy = jest.spyOn(document!, 'removeEventListener');

    const component = renderer.create(<OnScroll callback={callback} />);

    expect(addSpy).toHaveBeenCalledWith('touchmove', callback, { passive: false });
    expect(addSpy).toHaveBeenCalledWith('scroll', callback, { passive: false });

    component.unmount();

    expect(removeSpy).toHaveBeenCalledWith('touchmove', callback);
    expect(removeSpy).toHaveBeenCalledWith('scroll', callback);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
