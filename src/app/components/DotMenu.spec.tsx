import React from 'react';
import renderer from 'react-test-renderer';
import TestContainer from '../../test/TestContainer';
import { DotMenuDropdown, DotMenuDropdownList } from './DotMenu';
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
