import React from 'react';
import styled from 'styled-components';
import { EllipsisV } from 'styled-icons/fa-solid/EllipsisV';
import { PlainButton } from '../../../components/Button';
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

// tslint:disable-next-line:variable-name
const MenuToggle = styled(React.forwardRef<HTMLDivElement>((props, ref) =>
  <PlainButton {...props} ref={ref}>
    <div tabIndex={-1}>
      <MenuIcon />
    </div>
  </PlainButton>
))`
  border: none;
  display: block;

  > div {
    display: inline-block;
    outline: none;
  }
`;

export default MenuToggle;
