import React from 'react';
import renderer from 'react-test-renderer';
import * as reactUtils from '../../app/reactUtils';
import createTestServices from '../../test/createTestServices';
import * as Services from '../context/Services';
import MessageProvider from '../MessageProvider';
import Dropdown, { DropdownItem, DropdownList } from './Dropdown';

describe('Dropdown', () => {
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
      services = createTestServices();
    });

  it('matches snapshot', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Dropdown toggle={<button>show more</button>}>
          <DropdownList>
            <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
            <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
          </DropdownList>
        </Dropdown>
      </MessageProvider>
    </Services.Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for tab hidden (closed)', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Dropdown transparentTab={false} toggle={<button>show more</button>}>
          <DropdownList>
            <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
            <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
          </DropdownList>
        </Dropdown>
      </MessageProvider>
    </Services.Provider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for tab hidden (open)', () => {
    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Dropdown transparentTab={false} toggle={<button>show more</button>}>
          <DropdownList>
            <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
            <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
          </DropdownList>
        </Dropdown>
      </MessageProvider>
    </Services.Provider>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('tab hidden closes on focus lost', () => {
    const useFocusLost = jest.spyOn(reactUtils, 'useFocusLost');

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Dropdown transparentTab={false} toggle={<button>show more</button>}>
          <DropdownList>
            <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
            <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
          </DropdownList>
        </Dropdown>
      </MessageProvider>
    </Services.Provider>);

    renderer.act(() => {
      component.root.findByType('button').props.onClick();
    });

    expect(() => component.root.findByType(DropdownList)).not.toThrow();

    renderer.act(() => {
      useFocusLost.mock.calls[0][2]();
    });

    expect(() => component.root.findByType(DropdownList)).toThrow();
  });

  it('tab hidden closes on Esc', () => {
    const useOnEscSpy = jest.spyOn(reactUtils, 'useOnEsc');

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Dropdown transparentTab={false} toggle={<button>show more</button>}>
          <DropdownList>
            <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
            <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
          </DropdownList>
        </Dropdown>
      </MessageProvider>
    </Services.Provider>);

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
    const useOnEscSpy = jest.spyOn(reactUtils, 'useOnEsc');

    const focus = jest.fn();
    const addEventListener = jest.fn();
    const removeEventListener = jest.fn();
    const createNodeMock = () => ({focus, addEventListener, removeEventListener});

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Dropdown transparentTab={false} toggle={<button>show more</button>}>
          <DropdownList>
            <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
            <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
          </DropdownList>
        </Dropdown>
      </MessageProvider>
    </Services.Provider>, {createNodeMock});

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

  it(`items have onClick function even if it wasn't passed as prop`, () => {
    const mockEv = { preventDefault: jest.fn() };

    const component = renderer.create(<Services.Provider value={services}>
      <MessageProvider>
        <Dropdown toggle={<button>show more</button>}>
          <DropdownList>
            <DropdownItem message='i18n:highlighting:dropdown:delete' />
            <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          </DropdownList>
        </Dropdown>
      </MessageProvider>
    </Services.Provider>);

    renderer.act(() => {
      const [button1, button2] = component.root.findAllByType('a');
      button1.props.onClick(mockEv);
      button2.props.onClick(mockEv);
    });

    expect(mockEv.preventDefault).toHaveBeenCalledTimes(2);
  });
});
