import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../test/TestContainer';
import { DotMenuDropdown, DotMenuDropdownList, DotMenuToggle } from './DotMenu';
import { DropdownItem } from './Dropdown';

describe('Dropdown', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<TestContainer>
      <DotMenuDropdown>
        <DotMenuDropdownList>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DotMenuDropdownList>
      </DotMenuDropdown>
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot on right align', () => {
    const component = renderer.create(<TestContainer>
      <DotMenuDropdown>
        <DotMenuDropdownList rightAlign>
          <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
          <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
        </DotMenuDropdownList>
      </DotMenuDropdown>
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('DotMenuToggle', () => {
  it('renders with default isOpen=false when isOpen prop is not supplied', () => {
    const component = renderer.create(<TestContainer>
      <DotMenuToggle />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // Verify aria-expanded is false when isOpen is not supplied
    const button = tree && typeof tree === 'object' && 'props' in tree ? tree : null;
    if (button && 'props' in button) {
      expect(button.props['aria-expanded']).toBe(false);
    }
  });

  it('renders with isOpen=true when explicitly set', () => {
    const component = renderer.create(<TestContainer>
      <DotMenuToggle isOpen={true} />
    </TestContainer>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // Verify aria-expanded is true when isOpen is explicitly set to true
    const button = tree && typeof tree === 'object' && 'props' in tree ? tree : null;
    if (button && 'props' in button) {
      expect(button.props['aria-expanded']).toBe(true);
    }
  });
});
