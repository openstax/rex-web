import React from 'react';
import renderer from 'react-test-renderer';
import * as focusUtils from '../reactUtils/focusUtils';
import * as keyboardUtils from '../reactUtils/keyboardUtils';
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
    const useFocusLost = jest.spyOn(focusUtils, 'useFocusLost');

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
    const useOnEscSpy = jest.spyOn(keyboardUtils, 'useOnEsc');

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
    const useOnEscSpy = jest.spyOn(keyboardUtils, 'useOnEsc');

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

  it('TabTransparentDropdown handles focus in', () => {
    const component = renderer.create(<TestContainer>
      <Dropdown toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    // Find the dropdown focus wrapper div
    const focusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];

    // Initially, focus-within should not be present
    expect(focusWrapper.props.className).not.toContain('focus-within');

    // Simulate focus in
    renderer.act(() => {
      focusWrapper.props.onFocus();
    });

    // After focus in, focus-within should be present
    const updatedFocusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];
    expect(updatedFocusWrapper.props.className).toContain('focus-within');
  });

  it('TabTransparentDropdown handles focus out when focus moves outside', () => {
    const component = renderer.create(<TestContainer>
      <Dropdown toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    // Find the dropdown focus wrapper div
    const focusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];

    // Simulate focus in first
    renderer.act(() => {
      focusWrapper.props.onFocus();
    });

    // Verify focus-within is present
    let updatedFocusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];
    expect(updatedFocusWrapper.props.className).toContain('focus-within');

    // Simulate focus out to an element outside the dropdown (relatedTarget is outside)
    renderer.act(() => {
      const outsideElement = document?.createElement('div');
      focusWrapper.props.onBlur({
        currentTarget: {
          contains: jest.fn().mockReturnValue(false),
        },
        relatedTarget: outsideElement,
      });
    });

    // After focus out, focus-within should be removed
    updatedFocusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];
    expect(updatedFocusWrapper.props.className).not.toContain('focus-within');
  });

  it('TabTransparentDropdown handles focus out when relatedTarget is null', () => {
    const component = renderer.create(<TestContainer>
      <Dropdown toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    // Find the dropdown focus wrapper div
    const focusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];

    // Simulate focus in first
    renderer.act(() => {
      focusWrapper.props.onFocus();
    });

    // Verify focus-within is present
    let updatedFocusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];
    expect(updatedFocusWrapper.props.className).toContain('focus-within');

    // Simulate focus out with null relatedTarget (focus moved to browser UI or another app)
    renderer.act(() => {
      focusWrapper.props.onBlur({
        currentTarget: {
          contains: jest.fn(),
        },
        relatedTarget: null,
      });
    });

    // After focus out with null relatedTarget, focus-within should be removed
    updatedFocusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];
    expect(updatedFocusWrapper.props.className).not.toContain('focus-within');
  });

  it('TabTransparentDropdown maintains focus when moving within the dropdown', () => {
    const component = renderer.create(<TestContainer>
      <Dropdown toggle={<button>show more</button>}>
        <DropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
        </DropdownList>
      </Dropdown>
    </TestContainer>);

    // Find the dropdown focus wrapper div
    const focusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];

    // Simulate focus in first
    renderer.act(() => {
      focusWrapper.props.onFocus();
    });

    // Verify focus-within is present
    let updatedFocusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];
    expect(updatedFocusWrapper.props.className).toContain('focus-within');

    // Simulate focus moving to another element within the dropdown (relatedTarget is inside)
    renderer.act(() => {
      const insideElement = document?.createElement('div');
      focusWrapper.props.onBlur({
        currentTarget: {
          contains: jest.fn().mockReturnValue(true),
        },
        relatedTarget: insideElement,
      });
    });

    // Focus-within should still be present because focus is still within the dropdown
    updatedFocusWrapper = component.root.findAll(
      (el) => el.props.className && el.props.className.includes('dropdown-focus-wrapper')
    )[0];
    expect(updatedFocusWrapper.props.className).toContain('focus-within');
  });
});
