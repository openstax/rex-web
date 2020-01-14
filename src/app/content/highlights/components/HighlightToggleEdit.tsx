import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { Edit as EditIcon } from 'styled-icons/fa-solid/Edit';
import { TrashAlt as TrashAltIcon } from 'styled-icons/fa-solid/TrashAlt';
import Dropdown, { DropdownItem, DropdownList } from '../../../components/Dropdown';
import ColorPicker from './ColorPicker';
import { MenuToggle } from './DisplayNote';
import * as Styled from './ShowMyHighlightsStyles';

interface HighlightToggleEditProps {
  color: HighlightColorEnum;
  onDelete: () => void;
  onEdit: () => void;
  onColorChange: (color: string) => void;
}

// tslint:disable-next-line:variable-name
const HighlightToggleEdit = ({
  color,
  onColorChange,
  onEdit,
  onDelete,
}: HighlightToggleEditProps) => <Styled.HighlightToggleEdit>
  <Dropdown
    toggle={<MenuToggle/>}
    className='highlight-toggle-edit'
  >
    <Styled.HighlightToggleEditContent>
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
    </Styled.HighlightToggleEditContent>
  </Dropdown>
</Styled.HighlightToggleEdit>;

export default HighlightToggleEdit;
