import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import Dropdown, { DropdownItem, DropdownList } from '../../../../components/Dropdown';
import theme from '../../../../theme';
import { disablePrint } from '../../../components/utils/disablePrint';
import ColorPicker from '../ColorPicker';
import MenuToggle, { MenuIcon } from '../MenuToggle';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * Edit icon component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function EditIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 576 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"
      />
    </svg>
  );
}

const EditIcon = styled(EditIconBase)``;

/**
 * ExternalLinkAlt icon component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function LinkIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 576 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M576 24v127.984c0 21.461-25.96 31.98-40.971 16.971l-35.707-35.709-243.523 243.523c-9.373 9.373-24.568 9.373-33.941 0l-22.627-22.627c-9.373-9.373-9.373-24.569 0-33.941L442.756 76.676l-35.703-35.705C391.982 25.9 402.656 0 424.024 0H552c13.255 0 24 10.745 24 24zM407.029 270.794l-16 16A23.999 23.999 0 0 0 384 303.765V448H64V128h264a24.003 24.003 0 0 0 16.97-7.029l16-16C376.089 89.851 365.381 64 344 64H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V287.764c0-21.382-25.852-32.09-40.971-16.97z"
      />
    </svg>
  );
}

const LinkIcon = styled(LinkIconBase)``;

/**
 * TrashAlt icon component.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components component selector references
 */
function TrashAltIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 448 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"
      />
    </svg>
  );
}

const TrashAltIcon = styled(TrashAltIconBase)``;

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

const StyledDropdownList = styled(DropdownList)`
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

const StyledEditIcon = styled(EditIcon)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

const StyledTrashAltIcon = styled(TrashAltIcon)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

const StyledLinkIcon = styled(LinkIcon)`
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

const HighlightDropdownMenu = React.forwardRef<HTMLButtonElement, { isOpen?: boolean }>((props, ref) => {
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
