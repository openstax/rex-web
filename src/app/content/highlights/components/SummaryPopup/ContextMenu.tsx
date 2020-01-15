import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import styled from 'styled-components';
import { Edit as EditIcon } from 'styled-icons/fa-solid/Edit';
import { TrashAlt as TrashAltIcon } from 'styled-icons/fa-solid/TrashAlt';
import Dropdown, { DropdownFocusWrapper, DropdownItem, DropdownList } from '../../../../components/Dropdown';
import theme from '../../../../theme';
import ColorPicker from '../ColorPicker';
import MenuToggle from '../MenuToggle';

// tslint:disable-next-line:variable-name
export const StyledContextMenu = styled.div`
  .highlight-toggle-edit {
    position: absolute;
    width: 150px;
    top: 1.2rem;
    right: 0;
  }

  ${DropdownFocusWrapper} {
    svg {
      color: ${theme.color.neutral.darkest};
    }
  }

  ${ColorPicker} {
    label {
      margin: 0.6rem;
      width: 1.6rem;
      height: 1.6rem;

      svg {
        width: 1.2rem;
        height: 1.2rem;
      }
    }
  }

  ${DropdownList} {
    padding: 0;

    li {
      display: flex;

      a {
        width: 100%;

        svg {
          width: 15px;
          height: 15px;
          margin-right: 10px;
          color: ${theme.color.text.default};
        }
      }
    }
  }

  ${MenuToggle} {
    float: right;
    margin-right: 0.2rem;

    &:hover {
      svg {
        color: ${theme.color.secondary.lightGray.darkest};
      }
    }
  }
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
    className='highlight-toggle-edit'
  >
    <HighlightToggleEditContent>
      <ColorPicker
        color={color}
        onChange={onColorChange}
        onRemove={() => onDelete()}
      />
      <DropdownList>
        <DropdownItem
          data-testid='edit'
          message='i18n:highlighting:dropdown:edit'
          prefix={<EditIcon/>}
          onClick={() => onEdit()}
        />
        <DropdownItem
          data-testid='delete'
          message='i18n:highlighting:dropdown:delete'
          prefix={<TrashAltIcon/>}
          onClick={() => onDelete()}
        />
      </DropdownList>
    </HighlightToggleEditContent>
  </Dropdown>
</StyledContextMenu>;

export default ContextMenu;
