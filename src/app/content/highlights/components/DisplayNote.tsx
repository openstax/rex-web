import React from 'react';
import styled, { css } from 'styled-components/macro';
import { EllipsisV } from 'styled-icons/fa-solid/EllipsisV';
import Dropdown, { DropdownItem } from '../../../components/Dropdown';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { cardWidth } from '../constants';
import Confirmation from './Confirmation';

// tslint:disable-next-line:variable-name
const MenuIcon = styled(EllipsisV)`
  height: 2rem;
  width: 2rem;
  padding: 0.2rem;
  color: ${theme.color.neutral.darkest};
`;

interface Props {
  note: string;
  isFocused: boolean;
  onEdit: () => void;
  onRemove: () => void;
  className: string;
}

// tslint:disable-next-line:variable-name
const DisplayNote = ({note, onEdit, onRemove, className}: Props) => {
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);

  return <div className={className}>
    <Dropdown toggle={<MenuIcon />}>
      <DropdownItem message='edit' onClick={onEdit} />
      <DropdownItem message='delete' onClick={() => setConfirmingDelete(true)} />
    </Dropdown>
    {note}
    {confirmingDelete && <Confirmation
      message='Are you sure you want to delete this note and highlight?'
      onConfirm={onRemove}
      onCancel={() => setConfirmingDelete(false)}
    />}
  </div>;
};

export default styled(DisplayNote)`
  width: ${cardWidth}rem;
  overflow: visible;
  background: ${theme.color.neutral.formBackground};
  ${(props: Props) => props.isFocused && css`
    background: ${theme.color.white};
  `}
  ${textStyle}
  font-size: 1.4rem;
  line-height: 1.8rem;

  ${Dropdown} {
    position: absolute;
    top: 0.8rem;
    right: -0.2rem;

    .focus-within ${MenuIcon} {
      color: ${theme.color.primary.gray.lighter};
    }

    :focus-within ${MenuIcon} {
      color: ${theme.color.primary.gray.lighter};
    }
  }
`;
