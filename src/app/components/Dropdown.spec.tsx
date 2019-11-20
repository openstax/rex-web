import React from 'react';
import renderer from 'react-test-renderer';
import MessageProvider from '../MessageProvider';
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
});
