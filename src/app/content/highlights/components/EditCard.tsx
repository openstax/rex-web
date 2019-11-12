import { Highlight } from '@openstax/highlighter';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import Button, { ButtonGroup } from '../../../components/Button';
import theme from '../../../theme';
import { assertWindow, mergeRefs } from '../../../utils';
import { clearFocusedHighlight, createHighlight, updateHighlight } from '../actions';
import { cardPadding, highlightStyles } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import Note from './Note';
import onClickOutside from './utils/onClickOutside';

interface Props {
  authenticated: boolean;
  loginLink: string;
  isFocused: boolean;
  highlight: Highlight;
  onCreate: typeof createHighlight;
  onBlur: typeof clearFocusedHighlight;
  onSave: typeof updateHighlight;
  onRemove: () => void;
  onCancel: () => void;
  data?: HighlightData;
  className: string;
}

// tslint:disable-next-line:variable-name
const EditCard = React.forwardRef<HTMLElement, Props>((
  {
    authenticated,
    className,
    data,
    highlight,
    isFocused,
    loginLink,
    onBlur,
    onCancel,
    onCreate,
    onRemove,
    onSave,
  }: Props,
  ref
) => {
  const defaultNote = () => data && data.note ? data.note : '';
  const [pendingNote, setPendingNote] = React.useState<string>(defaultNote());
  const [editingNote, setEditing] = React.useState<boolean>(!!data && !!data.note);
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);

  const blurIfNotEditing = () => {
    if (!editingNote) {
      onBlur();
    }
  };

  React.useEffect(onClickOutside(element, isFocused, blurIfNotEditing), [isFocused, editingNote]);

  const onColorChange = (style: string) => {
    highlight.setStyle(style);
    if (data) {
      onSave({...data, style});
    } else {
      assertWindow().getSelection().removeAllRanges();
      onCreate(highlight.serialize().data);
    }
  };

  const saveNote = () => {
    onSave({...(data || highlight.serialize().data), note: pendingNote});
  };

  const cancelEditing = () => {
    setPendingNote(defaultNote());
    setEditing(false);
    onCancel();
  };

  return <form
    className={className}
    ref={mergeRefs(ref, element)}
    data-analytics-region='edit-note'
  >
    <ColorPicker color={data ? data.style : undefined} onChange={onColorChange} onRemove={() => {
      if ((!data || !data.note) && !pendingNote) {
        onRemove();
      }
    }} />
    <Note
      note={pendingNote}
      onFocus={() => {
        if (!highlight.getStyle()) {
          onColorChange(highlightStyles[0].label);
        }
      }}
      onChange={(newValue) => {
        setPendingNote(newValue);
        setEditing(true);
      }}
    />
    {editingNote && <ButtonGroup>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          data-analytics-label='save'
          size='small'
          variant='primary'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            setEditing(false);

            if (pendingNote === '' && data && data.note) {
              setConfirmingDelete(true);
            } else {
              saveNote();
            }
          }}
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg: Element | string) => <Button
          size='small'
          data-analytics-label='cancel'
          data-testid='cancel'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            cancelEditing();
          }}
        >{msg}</Button>}
      </FormattedMessage>
    </ButtonGroup>}
    {confirmingDelete && <Confirmation
      data-testid='confirm-delete'
      data-analytics-region='highlighting-delete-note'
      message='i18n:highlighting:confirmation:delete-note'
      confirmMessage='i18n:highlighting:button:delete'
      onConfirm={saveNote}
      onCancel={() => {
        setEditing(true);
        setPendingNote(defaultNote());
      }}
      always={() => setConfirmingDelete(false)}
    />}
    {!authenticated && <Confirmation
      data-analytics-region='highlighting-login'
      message='i18n:highlighting:login:prompt'
      confirmMessage='i18n:highlighting:login:link'
      confirmLink={loginLink}
      onCancel={onBlur}
    />}
  </form>;
});

export default styled(EditCard)`
  background: ${theme.color.neutral.formBackground};
  user-select: none;
  overflow: visible;

  ${ButtonGroup} {
    margin-top: ${cardPadding}rem;
  }

  ${theme.breakpoints.mobile(css`
    visibility: hidden;
  `)}
`;
