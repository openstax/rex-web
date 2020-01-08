import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import { EllipsisV } from 'styled-icons/fa-solid/EllipsisV';
import Dropdown, { DropdownItem, DropdownList } from '../../../components/Dropdown';
import Times from '../../../components/Times';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import { mergeRefs } from '../../../utils';
import { cardPadding, cardWidth, highlightStyles } from '../constants';
import Confirmation from './Confirmation';
import TruncatedText from './TruncatedText';
import onClickOutside from './utils/onClickOutside';

// tslint:disable-next-line:variable-name
const MenuIcon = styled(EllipsisV)`
  height: 2rem;
  width: 2rem;
  padding: 0.2rem;
  color: ${theme.color.primary.gray.lighter};
  user-select: none;
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

// tslint:disable-next-line:variable-name
export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  color: ${theme.color.primary.gray.lighter};
  height: 4.2rem;
  width: 4.2rem;
  padding: 1.6rem;
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  ${theme.breakpoints.mobile(css`
    display: block;
 `)}
`;

interface Props {
  note: string;
  style: typeof highlightStyles[number];
  isFocused: boolean;
  onEdit: () => void;
  onBlur: () => void;
  onRemove: () => void;
  className: string;
}

// tslint:disable-next-line:variable-name
const DisplayNote = React.forwardRef<HTMLElement, Props>((
  {note, isFocused, onBlur, onEdit, onRemove, className}: Props,
  ref
) => {
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);

  React.useEffect(onClickOutside(element, isFocused, onBlur), [isFocused]);

  return <div className={className} ref={mergeRefs(ref, element)}>
    <Dropdown toggle={<MenuToggle />}>
      <DropdownList>
        <DropdownItem message='i18n:highlighting:dropdown:edit' onClick={onEdit} />
        <DropdownItem
          message='i18n:highlighting:dropdown:delete'
          data-testid='delete'
          onClick={() => setConfirmingDelete(true)}
        />
      </DropdownList>
    </Dropdown>
    <CloseIcon onClick={onBlur} />
    <label>Note:</label>
    <TruncatedText text={note} isFocused={isFocused} />
    {confirmingDelete && <Confirmation
      message='i18n:highlighting:confirmation:delete-both'
      confirmMessage='i18n:highlighting:button:delete'
      onConfirm={onRemove}
      onCancel={() => setConfirmingDelete(false)}
    />}
  </div>;
});

export default styled(DisplayNote)`
  width: ${cardWidth}rem;
  overflow: visible;
  background: ${theme.color.neutral.formBackground};
  ${(props: Props) => props.isFocused && css`
    background: ${theme.color.white};
  `}

  > label {
    display: none;
    ${textStyle}
    color: ${(props: Props) => props.style.focused};
    font-size: 1.4rem;
    line-height: 2rem;
    margin: ${cardPadding * 1.5}rem 0 0 ${cardPadding * 2}rem;
  }

  ${css`
    ${DropdownList}${DropdownList} {
      left: -4rem;
    }
  `}

  ${Dropdown} {
    position: absolute;
    top: 0.8rem;
    right: -0.2rem;

    .focus-within ${MenuIcon} {
      color: ${theme.color.primary.gray.base};
    }

    :focus-within ${MenuIcon} {
      color: ${theme.color.primary.gray.base};
    }
  }

  ${theme.breakpoints.mobile(css`
    width: unset;

    > label {
      display: block;
    }

    ${Dropdown} {
      display: none;
    }
 `)}
`;
