import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import styled from 'styled-components';
import { Edit as EditIcon } from 'styled-icons/fa-solid/Edit';
import { TrashAlt as TrashAltIcon } from 'styled-icons/fa-solid/TrashAlt';
import Dropdown, { DropdownItem, DropdownList } from '../../../../components/Dropdown';
import theme from '../../../../theme';
import ColorPicker from '../ColorPicker';
import MenuToggle, { MenuIcon } from '../MenuToggle';

// tslint:disable-next-line:variable-name
export const StyledContextMenu = styled.div`
  ${Dropdown} {
    position: absolute;
    width: 150px;
    top: 1.2rem;
    right: 0;

    .focus-within ${MenuIcon} {
      color: ${theme.color.secondary.lightGray.darkest};
    }

    :focus-within ${MenuIcon} {
      color: ${theme.color.secondary.lightGray.darkest};
    }
  }

  ${ColorPicker} {
    margin: 0.6rem 0 0 0.6rem;
  }

  ${MenuToggle} {
    float: right;
    margin-right: 0.2rem;
  }
`;

// tslint:disable-next-line: variable-name
const StyledDropdownList = styled(DropdownList)`
  padding: 0;

  li {
    display: flex;

    a {
      width: 100%;
    }
  }
`;

// tslint:disable-next-line:variable-name
const StyledEditIcon = styled(EditIcon)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

// tslint:disable-next-line:variable-name
const StyledTrashAltIcon = styled(TrashAltIcon)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

// tslint:disable-next-line:variable-name
const HighlightToggleEditContent = styled.div`
  z-index: 2;
  border: 1px solid ${theme.color.neutral.formBorder};
  background-color: ${theme.color.neutral.formBackground};
`;

interface ContextMenuProps {
  color: HighlightColorEnum;
  onDelete: () => void;
  onEdit: () => void;
  onColorChange: (color: string) => void;
}

// tslint:disable-next-line:variable-name
const ContextMenu = ({
  color,
  onColorChange,
  onEdit,
  onDelete,
}: ContextMenuProps) => <StyledContextMenu>
  <Dropdown
    toggle={<MenuToggle/>}
  >
    <HighlightToggleEditContent>
      <ColorPicker
        color={color}
        size='small'
        onChange={onColorChange}
      />
      <StyledDropdownList>
        <DropdownItem
          data-testid='edit'
          message='i18n:highlighting:dropdown:edit'
          prefix={<StyledEditIcon/>}
          onClick={() => onEdit()}
        />
        <DropdownItem
          data-testid='delete'
          message='i18n:highlighting:dropdown:delete'
          prefix={<StyledTrashAltIcon/>}
          onClick={() => onDelete()}
        />
      </StyledDropdownList>
    </HighlightToggleEditContent>
  </Dropdown>
</StyledContextMenu>;

export default ContextMenu;
