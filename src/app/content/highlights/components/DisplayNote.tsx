import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import Dropdown, { DropdownItem, DropdownList } from '../../../components/Dropdown';
import Times from '../../../components/Times';
import { textStyle } from '../../../components/Typography/base';
import { useDebouncedWindowSize } from '../../../reactUtils';
import theme from '../../../theme';
import { mergeRefs } from '../../../utils';
import { highlightStyles } from '../../constants';
import { query } from '../../search/selectors';
import { tocOpen } from '../../selectors';
import { focusHighlight } from '../actions';
import { cardPadding, cardWidth } from '../constants';
import Confirmation from './Confirmation';
import MenuToggle, { MenuIcon } from './MenuToggle';
import TruncatedText from './TruncatedText';
import { isElementForOnClickOutside, useOnClickOutside } from './utils/onClickOutside';

// tslint:disable-next-line:variable-name
const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  color: ${theme.color.primary.gray.lighter};
  height: 4.2rem;
  width: 4.2rem;
  padding: 1.6rem;
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  ${theme.breakpoints.touchDeviceQuery(css`
    display: block;
 `)}
`;

export interface DisplayNoteProps {
  highlight: Highlight;
  note: string;
  style: typeof highlightStyles[number];
  isActive: boolean;
  focus: typeof focusHighlight;
  onEdit: () => void;
  onBlur: () => void;
  onRemove: () => void;
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  className: string;
}

// tslint:disable-next-line:variable-name
const DisplayNote = React.forwardRef<HTMLElement, DisplayNoteProps>((
  {note, isActive, highlight, focus, onBlur, onEdit, onRemove, onHeightChange, className},
  ref
) => {
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);
  const confirmationRef = React.useRef<HTMLElement>(null);
  const [textToggle, setTextToggle] = React.useState(false);
  const [width] = useDebouncedWindowSize();
  const searchQuery = useSelector(query);
  const isTocOpen = useSelector(tocOpen);

  const onToggle = () => {
    if (!isActive) {
      focus(highlight.id);
    }
  };

  const elements = React.useMemo(
    () => [element, ...highlight.elements].filter(isElementForOnClickOutside),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [element.current, highlight]);

  // Change Event phase so when clicking on another Card,
  // onBlur is called before this Card calls focus.
  useOnClickOutside(elements, isActive, onBlur, { capture: true });

  React.useEffect(() => {
    if (!isActive) {
      setConfirmingDelete(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  React.useEffect(() => {
    const refElement = confirmationRef.current ? confirmationRef : element;
    onHeightChange(refElement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, confirmationRef, confirmingDelete, textToggle, width, isTocOpen, searchQuery]);

  return <div className={className} ref={mergeRefs(ref, element)} tabIndex={-1} data-highlight-card>
    <Dropdown toggle={<MenuToggle />} onToggle={onToggle} transparentTab={false}>
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
    <TruncatedText text={note} isActive={isActive} onChange={() => setTextToggle((state) => !state)} />
    {confirmingDelete && <Confirmation
      ref={confirmationRef}
      data-analytics-label='delete'
      data-analytics-region='confirm-delete-inline-highlight'
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
  ${(props: DisplayNoteProps) => props.isActive && css`
    background: ${theme.color.white};
  `}

  > label {
    display: none;
    ${textStyle}
    color: ${(props: DisplayNoteProps) => props.style.focused};
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

  ${theme.breakpoints.touchDeviceQuery(css`
    width: unset;

    > label {
      display: block;
    }

    ${Dropdown} {
      display: none;
    }
 `)}
`;
