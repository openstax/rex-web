import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../MessageProvider';
import Dropdown, { DropdownItem } from './Dropdown';

describe('Dropdown', () => {
  it('matches snapshot', () => {
    const component = renderer.create(<MessageProvider>
      <Dropdown toggle='i18n:highlighting:card:show-more'>
        <DropdownItem onClick={() => null} message='i18n:highlighting:dropdown:delete' />
        <DropdownItem onClick={() => null} href='/wooo' message='i18n:highlighting:dropdown:edit' />
      </Dropdown>
    </MessageProvider>);

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
