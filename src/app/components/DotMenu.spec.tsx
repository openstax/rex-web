import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../test/TestContainer';
import { DotMenuDropdown, DotMenuDropdownList, DotMenuToggle } from './DotMenu';
import { DropdownItem } from './Dropdown';

const hasClass = (className: string) => (node: renderer.ReactTestInstance) =>
  typeof node.type === 'string' && String(node.props.className || '').split(' ').includes(className);

const renderMenu = (rightAlign?: boolean) => renderer.create(<TestContainer>
  <DotMenuDropdown>
    <DotMenuDropdownList rightAlign={rightAlign}>
      <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
      <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
    </DotMenuDropdownList>
  </DotMenuDropdown>
</TestContainer>);

describe('DotMenuDropdown', () => {
  it('lists its items in order, as a button and a link', () => {
    const menu = renderMenu().root.findByType('menu');

    expect(menu.findByType('button').children).toEqual(['Delete']);
    expect(menu.findByType('a').props.href).toBe('/wooo');
    expect(menu.findByType('a').children).toEqual(['Edit']);
  });

  it('has a toggle labelled Actions by default', () => {
    const toggles = renderMenu().root.findAll(hasClass('dot-menu-toggle'));

    expect(toggles.length).toBeGreaterThan(0);
    toggles.forEach((toggle) => expect(toggle.props['aria-label']).toBe('Actions'));
  });

  it('left-aligns the menu unless asked to right-align it', () => {
    const root = renderMenu().root;

    expect(root.findAll(hasClass('dot-menu-left-align'))).toHaveLength(1);
    expect(root.findAll(hasClass('dot-menu-right-align'))).toHaveLength(0);
  });

  it('right-aligns the menu and its list when asked', () => {
    const root = renderMenu(true).root;

    expect(root.findAll(hasClass('dot-menu-left-align'))).toHaveLength(0);
    expect(root.findAll(hasClass('dot-menu-right-align')).map((node) => node.type).sort())
      .toEqual(['div', 'menu']);
  });
});

describe('DotMenuToggle', () => {
  it('renders without aria-expanded when isOpen prop is not supplied', () => {
    const component = renderer.create(<TestContainer>
      <DotMenuToggle />
    </TestContainer>);

    // Verify aria-expanded is not set when isOpen is not supplied
    const button = component.root.findByType('button');
    expect(button.props['aria-expanded']).toBeUndefined();
  });

  it('puts the icon directly in the button, hidden from assistive technology', () => {
    const button = renderer.create(<TestContainer>
      <DotMenuToggle />
    </TestContainer>).root.findByType('button');

    expect(button.findAllByType('div')).toHaveLength(0);
    expect(button.findByType('svg').props['aria-hidden']).toBe('true');
  });

  it('uses a supplied aria-label in place of the default', () => {
    const component = renderer.create(<TestContainer>
      <DotMenuToggle aria-label='Actions for highlighted text' />
    </TestContainer>);

    expect(component.root.findByType('button').props['aria-label']).toBe('Actions for highlighted text');
  });

  it('renders with isOpen=true when explicitly set', () => {
    const component = renderer.create(<TestContainer>
      <DotMenuToggle isOpen={true} />
    </TestContainer>);

    // Verify aria-expanded is true when isOpen is explicitly set to true
    const button = component.root.findByType('button');
    expect(button.props['aria-expanded']).toBe(true);
  });
});
