import { Highlight } from '@openstax/highlighter';
import React from 'react';
import styled from 'styled-components/macro';
import Button, { ButtonGroup } from '../../../components/Button';
import { clearFocusedHighlight, createHighlight, deleteHighlight, updateHighlight } from '../actions';
import { cardPadding, highlightStyles } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import Note from './Note';

interface Props {
  isFocused: boolean;
  highlight: Highlight;
  create: typeof createHighlight;
  blur: typeof clearFocusedHighlight;
  save: typeof updateHighlight;
  remove: typeof deleteHighlight;
  data?: HighlightData;
  className: string;
}

// tslint:disable-next-line:variable-name
const EditCard = ({highlight, className, data, create, save, remove, blur}: Props) => {
  const defaultNote = () => data && data.note ? data.note : '';
  const [pendingNote, setPendingNote] = React.useState<string>(defaultNote());
  const [editingNote, setEditing] = React.useState<boolean>(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);

  const onColorChange = (style: string) => {
    highlight.setStyle(style);
    if (data) {
      save({...data, style});
    } else {
      create(highlight.serialize().data);
    }
  };

  const onRemove = () => data && remove(data.id);

  const saveNote = () => {
    save({...(data || highlight.serialize().data), note: pendingNote});
    blur();
  };

  const cancelEditing = () => {
    setPendingNote(defaultNote());
    setEditing(false);
    blur();
  };

  return <form className={className}>
    <ColorPicker color={data ? data.style : undefined} onChange={onColorChange} onRemove={() => {
      if ((!data || !data.note) && !pendingNote) {
        onRemove();
      }
    }} />
    <Note note={pendingNote} onChange={(newValue) => {
      if (!data) {
        onColorChange(highlightStyles[0].label);
      }
      setPendingNote(newValue);
      setEditing(true);
    }} />
    {editingNote && <ButtonGroup>
      <Button size='small' variant='primary' onClick={(e: React.FormEvent) => {
        e.preventDefault();
        setEditing(false);

        if (pendingNote === '' && data && data.note) {
          setConfirmingDelete(true);
        } else {
          saveNote();
        }
      }}>Save</Button>
      <Button size='small' onClick={(e: React.FormEvent) => {
        e.preventDefault();
        cancelEditing();
      }}>Cancel</Button>
    </ButtonGroup>}
    {confirmingDelete && <Confirmation
      message='Are you sure you want to delete this note?'
      onConfirm={saveNote}
      onCancel={() => {
        setEditing(true);
        setPendingNote(defaultNote());
      }}
      always={() => setConfirmingDelete(false)}
    />}
  </form>;
};

export default styled(EditCard)`
  ${ButtonGroup} {
    margin-top: ${cardPadding}rem;
  }
`;
