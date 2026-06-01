import { Highlight } from '@openstax/highlighter';
import { HTMLElement, FocusEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { useSelector } from 'react-redux';
import Dropdown, { DropdownItem, DropdownList } from '../../../components/Dropdown';
import Times from '../../../components/Times';
import { useDebouncedWindowSize, useFocusElement } from '../../../reactUtils';
import { mergeRefs } from '../../../utils';
import { query } from '../../search/selectors';
import { tocOpen } from '../../selectors';
import { focusHighlight } from '../actions';
import Confirmation from './Confirmation';
import MenuToggle from './MenuToggle';
import TruncatedText from './TruncatedText';
import { isElementForOnClickOutside, useOnClickOutside } from './utils/onClickOutside';
import './DisplayNote.css';

export interface DisplayNoteProps {
  highlight: Highlight;
  note: string;
  highlightStyle: { label: string; focused: string; passive: string };
  isActive: boolean;
  focus: typeof focusHighlight;
  onEdit: () => void;
  onBlur: () => void;
  onRemove: () => void;
  onHeightChange: (ref: React.RefObject<HTMLElement>) => void;
  className: string;
  shouldFocusCard: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  'data-testid'?: string;
  'data-active'?: boolean;
  'data-hidden'?: boolean;
  'data-toc-open'?: boolean;
  'data-has-query'?: boolean;
}

const DisplayNote = React.forwardRef<HTMLElement, DisplayNoteProps>((
  {note, isActive, highlight, onBlur, onEdit, onRemove,
  onHeightChange, className, shouldFocusCard, onClick, highlightStyle, style, focus: _focus, ...restProps},
  ref
) => {
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);
  const confirmationRef = React.useRef<HTMLElement>(null);
  const dropdownRef = React.useRef<HTMLElement>(null);
  const [textToggle, setTextToggle] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [width] = useDebouncedWindowSize();
  const searchQuery = useSelector(query);
  const isTocOpen = useSelector(tocOpen);
  const noteId = `display-note-${highlight.id}`;

  const elements = React.useMemo(
    () => [element, ...highlight.elements].filter(isElementForOnClickOutside),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [element.current, highlight]);

  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  // Change Event phase so when clicking on another Card,
  // onBlur is called before this Card calls focus.
  useOnClickOutside(elements, isActive, onBlur, { capture: true });
  // Close the dropdown when clicking outside it, since the card
  // may not be active and useOnClickOutside above won't fire.
  useOnClickOutside(dropdownRef, menuOpen, closeMenu);

  useFocusElement(element, shouldFocusCard);

  React.useEffect(() => {
    if (!isActive) {
      setConfirmingDelete(false);
      setMenuOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  React.useEffect(() => {
    const refElement = confirmationRef.current ? confirmationRef : element;
    onHeightChange(refElement);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, confirmationRef, confirmingDelete, textToggle, width, isTocOpen, searchQuery]);

  // Prevent focusin from the dropdown area from bubbling up to the card,
  // which would activate the card via useFocusIn.
  React.useEffect(() => {
    const el = dropdownRef.current;
    if (!el) { return; }
    const stopFocusPropagation = (e: FocusEvent) => e.stopPropagation();
    el.addEventListener('focusin', stopFocusPropagation);
    return () => el.removeEventListener('focusin', stopFocusPropagation);
  }, []);

  // Combine style from Card.tsx with highlight color CSS custom property
  const combinedStyle: React.CSSProperties = {
    ...style,
    '--highlight-color': highlightStyle.focused,
  } as React.CSSProperties;

  return (
    <div
      className={`${className} display-note`}
      ref={mergeRefs(ref, element)}
      tabIndex={-1}
      data-highlight-card
      role='dialog'
      aria-labelledby={noteId}
      onClick={onClick}
      style={combinedStyle}
      {...restProps}
    >
      <Dropdown
        className="dropdown"
        ref={dropdownRef}
        toggle={<MenuToggle isOpen={menuOpen} data-no-card-activate />}
        transparentTab={confirmingDelete}
        open={menuOpen}
        setOpen={setMenuOpen}
        menuClassName='display-note-menu'
      >
        <DropdownList>
          <DropdownItem message='i18n:highlighting:dropdown:edit' onClick={onEdit} />
          <DropdownItem
            message='i18n:highlighting:dropdown:delete'
            data-testid='delete'
            onClick={() => setConfirmingDelete(true)}
          />
        </DropdownList>
      </Dropdown>
      <Times
        className="display-note-close-icon"
        onClick={onBlur}
        aria-hidden='true'
      />
      <TruncatedText id={noteId} text={note} isActive={isActive} onChange={() => setTextToggle((state) => !state)} />
      {confirmingDelete && <Confirmation
        ref={confirmationRef}
        data-analytics-label='delete'
        data-analytics-region='confirm-delete-inline-highlight'
        message='i18n:highlighting:confirmation:delete-both'
        confirmMessage='i18n:highlighting:button:delete'
        onConfirm={onRemove}
        onCancel={() => setConfirmingDelete(false)}
      />}
    </div>
  );
});

export default DisplayNote;
