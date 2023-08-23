import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useIntl } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { Edit as EditIcon } from 'styled-icons/fa-solid/Edit';
import { ExternalLinkAlt as LinkIcon } from 'styled-icons/fa-solid/ExternalLinkAlt';
import { TrashAlt as TrashAltIcon } from 'styled-icons/fa-solid/TrashAlt';
import Dropdown, { DropdownItem, DropdownList } from '../../../../components/Dropdown';
import theme from '../../../../theme';
import { disablePrint } from '../../../components/utils/disablePrint';
import ColorPicker from '../ColorPicker';
import MenuToggle, { MenuIcon } from '../MenuToggle';

// tslint:disable-next-line:variable-name
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

  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
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

// tslint:disable-next-line: variable-name
const StyledLinkIcon = styled(LinkIcon)`
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
  margin-bottom: 1rem; /* for last context menu to show with more space */
`;

// tslint:disable-next-line:variable-name
const HighlightDropdownMenu = React.forwardRef((props, ref) => {
  return <MenuToggle
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

// tslint:disable-next-line:variable-name
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
        <ColorPicker
          color={color}
          size='small'
          onChange={onColorChange}
        />
        <StyledDropdownList>
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
