import React from 'react';
import renderer from 'react-test-renderer';
import * as reactUtils from '../../app/reactUtils';
import TestContainer from '../../test/TestContainer';
import Dropdown, { DropdownItem, DropdownList, callOrRefocus } from './Dropdown';

describe('Dropdown', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer>
      <Dropdown toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for tab hidden (closed)', () => {
    const component = renderer.create(<TestContainer>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for tab hidden (open)', () => {
    const component = renderer.create(<TestContainer>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('tab hidden closes on focus lost', () => {
    const useFocusLost = jest.spyOn(reactUtils, 'useFocusLost');

    const component = renderer.create(<TestContainer>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    expect(() => component.root.findByType(DropdownList)).not.toThrow();

    renderer.act(() => {
      useFocusLost.mock.calls[0][2]();
    });

    expect(() => component.root.findByType(DropdownList)).toThrow();
  });

  it('callOrRefocus refocuses when container.match(:hover)', () => {
    const cb = jest.fn();
    const matches = jest.fn().mockReturnValue(true);
    const focus = jest.fn();

    // @ts-expect-error not HTMLElements
    callOrRefocus(cb, {matches}, {focus});
    expect(cb).not.toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  });

  it('tab hidden closes on Esc', () => {
    const useOnEscSpy = jest.spyOn(reactUtils, 'useOnEsc');

    const component = renderer.create(<TestContainer>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    expect(() => component.root.findByType(DropdownList)).not.toThrow();

    renderer.act(() => {
      useOnEscSpy.mock.calls[0][1]();
    });

    expect(() => component.root.findByType(DropdownList)).toThrow();

    useOnEscSpy.mockClear();
  });

  it('tab hidden focus after Esc', () => {
    const useOnEscSpy = jest.spyOn(reactUtils, 'useOnEsc');

    const focus = jest.fn();
    const focus2 = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener, removeEventListener});

    const component = renderer.create(<TestContainer>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </TestContainer>, {createNodeMock});

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    expect(() => component.root.findByType(DropdownList)).not.toThrow();

    renderer.act(() => {
      const buttons = component.root.findAllByType('button');

      buttons[1].props.onMouseEnter({target: {focus: focus2}});
    });

    renderer.act(() => {
      useOnEscSpy.mock.calls[0][1]();
    });

    expect(() => component.root.findByType(DropdownList)).toThrow();
    expect(focus).toHaveBeenCalled();
    expect(focus2).toHaveBeenCalled();

    useOnEscSpy.mockClear();
  });

  it(`items have onClick function even if it wasn't passed as prop`, () => {
    const mockEv = { preventDefault: jest.fn() };

    const component = renderer.create(<TestContainer>
      <Dropdown toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    renderer.act(() => {
      const items = component.root.findAll((i) => i.props.onClick && i.type === 'button');

      items.forEach((i) => i.props.onClick(mockEv));
      expect(items.length).toBe(2);
    });

    expect(mockEv.preventDefault).toHaveBeenCalledTimes(2);
  });
});
