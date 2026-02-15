import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useIntl } from 'react-intl';
import styled, { AnyStyledComponent } from 'styled-components/macro';
import { Edit as EditIcon } from 'styled-icons/fa-solid/Edit';
import { ExternalLinkAlt as LinkIcon } from 'styled-icons/fa-solid/ExternalLinkAlt';
import { TrashAlt as TrashAltIcon } from 'styled-icons/fa-solid/TrashAlt';
import Dropdown, { DropdownItem, DropdownList } from '../../../../components/Dropdown';
import theme from '../../../../theme';
import { disablePrint } from '../../../components/utils/disablePrint';
import ColorPicker from '../ColorPicker';
import MenuToggle, { MenuIcon } from '../MenuToggle';

export const StyledContextMenu = styled.div`
  ${disablePrint}

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

const StyledDropdownList = styled(DropdownList as AnyStyledComponent)`
  padding: 0;

  li {
    display: flex;

    button,
    a {
      border: 0;
      width: 100%;

      :focus,
      :hover {
        outline-width: 0;
      }
    }
  }
`;

const StyledEditIcon = styled(EditIcon as AnyStyledComponent)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

const StyledTrashAltIcon = styled(TrashAltIcon as AnyStyledComponent)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

const StyledLinkIcon = styled(LinkIcon as AnyStyledComponent)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

const HighlightToggleEditContent = styled.div`
  z-index: 2;
  border: 1px solid ${theme.color.neutral.formBorder};
  background-color: ${theme.color.neutral.formBackground};
  margin-bottom: 1rem; /* for last context menu to show with more space */
`;

const HighlightDropdownMenu = React.forwardRef((props, ref) => {
  return <MenuToggle
    data-testid='highlight-dropdown-menu-toggle'
    aria-label={useIntl().formatMessage({id: 'i18n:highlighting:dropdown:edit:aria-label'})}
    ref={ref}
    {...props}
  />;
});

interface ContextMenuProps {
  highlight: Highlight;
  linkToHighlight: string;
  onDelete: () => void;
  onEdit: () => void;
  onColorChange: (color: HighlightColorEnum) => void;
}

const ContextMenu = ({
  highlight: {
    color,
    annotation: hasAnnotation,
  },
  linkToHighlight,
  onColorChange,
  onEdit,
  onDelete,
}: ContextMenuProps) => {
  const editMessage = hasAnnotation ? 'i18n:highlighting:dropdown:edit' : 'i18n:highlighting:dropdown:add-note';
  const deleteMessage = 'i18n:highlighting:dropdown:delete';

  return <StyledContextMenu>
    <Dropdown
      toggle={<HighlightDropdownMenu />}
      transparentTab={false}
    >
      <HighlightToggleEditContent>
        <StyledDropdownList>
          <li>
            <ColorPicker
            data-testid='highlight-dropdown-menu-color-picker'
            color={color}
            size='small'
            onChange={onColorChange}
            />
          </li>
          <DropdownItem
            data-testid='edit'
            ariaMessage={editMessage}
            message={editMessage}
            prefix={<StyledEditIcon/>}
            onClick={() => onEdit()}
          />
          <DropdownItem
            data-testid='delete'
            ariaMessage={deleteMessage}
            message={deleteMessage}
            prefix={<StyledTrashAltIcon/>}
            onClick={() => onDelete()}
          />
          <DropdownItem
            data-testid='go-to-highlight'
            dataAnalyticsRegion='MH gotohighlight'
            message='i18n:highlighting:dropdown:go-to-highlight'
            prefix={<StyledLinkIcon/>}
            href={linkToHighlight}
            target='_blank'
          />
        </StyledDropdownList>
      </HighlightToggleEditContent>
    </Dropdown>
  </StyledContextMenu>;
};

export default ContextMenu;
