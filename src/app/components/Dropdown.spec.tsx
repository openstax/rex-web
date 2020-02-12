import React from 'react';
import renderer from 'react-test-renderer';
import * as onClickOutside from '../content/highlights/components/utils/onClickOutside';
import MessageProvider from '../MessageProvider';
import * as utils from '../utils';
import Dropdown, { DropdownItem, DropdownList } from './Dropdown';

describe('Dropdown', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <Dropdown toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for tab hidden (closed)', () => {
    const component = renderer.create(<MessageProvider>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for tab hidden (open)', () => {
    const component = renderer.create(<MessageProvider>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('tab hidden closes', () => {
    const useOnClickOutside = jest.spyOn(onClickOutside, 'useOnClickOutside');

    const component = renderer.create(<MessageProvider>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    expect(() => component.root.findByType(DropdownList)).not.toThrow();

    renderer.act(() => {
      useOnClickOutside.mock.calls[0][2]();
    });

    expect(() => component.root.findByType(DropdownList)).toThrow();
  });

  it('tab hidden closes on Esc', () => {
    const useOnEscSpy = jest.spyOn(utils, 'useOnEsc');

    const component = renderer.create(<MessageProvider>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    expect(() => component.root.findByType(DropdownList)).not.toThrow();

    renderer.act(() => {
      useOnEscSpy.mock.calls[0][2]();
    });

    expect(() => component.root.findByType(DropdownList)).toThrow();

    useOnEscSpy.mockClear();
  });

  it('tab hidden focus after Esc', () => {
    const useOnEscSpy = jest.spyOn(utils, 'useOnEsc');

    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener, removeEventListener});

    const component = renderer.create(<MessageProvider>
      <Dropdown transparentTab={false} toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DropdownList>
      </Dropdown>
    </MessageProvider>, {createNodeMock});

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    expect(() => component.root.findByType(DropdownList)).not.toThrow();

    renderer.act(() => {
      useOnEscSpy.mock.calls[0][2]();
    });

    expect(() => component.root.findByType(DropdownList)).toThrow();
    expect(focus).toHaveBeenCalled();

    useOnEscSpy.mockClear();
  });
});
