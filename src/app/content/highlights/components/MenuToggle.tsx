import React from 'react';
import styled from 'styled-components';
import { EllipsisV } from 'styled-icons/fa-solid/EllipsisV';
import theme from '../../../theme';

// tslint:disable-next-line:variable-name
export const MenuIcon = styled(EllipsisV)`
  height: 2rem;
  width: 2rem;
  padding: 0.2rem;
  color: ${theme.color.neutral.darkest};
  user-select: none;

  &:hover {
    color: ${theme.color.secondary.lightGray.darkest};
  }
`;

/*
  this should be a button but Safari and firefox don't support focusing buttons
  https://bugs.webkit.org/show_bug.cgi?id=22261
  https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
*/
// tslint:disable-next-line:variable-name
const MenuToggle = styled(({className}) => <div tabIndex={0} className={className}><MenuIcon /></div>)`
  border: none;
  display: block;
`;

export default MenuToggle;
