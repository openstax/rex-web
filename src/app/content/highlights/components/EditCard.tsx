import { Highlight } from '@openstax/highlighter';
import { HighlightUpdateColorEnum } from '@openstax/highlighter/dist/api';
import { HighlightColorEnum } from '@openstax/highlighter/highlights-client/dist/models/Highlight';
import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import Button, { ButtonGroup } from '../../../components/Button';
import withServices from '../../../context/Services';
import theme from '../../../theme';
import { AppServices } from '../../../types';
import { assertWindow, mergeRefs } from '../../../utils';
import * as selectContent from '../../selectors';
import { clearFocusedHighlight, updateHighlight } from '../actions';
import { cardPadding, highlightStyles } from '../constants';
import { HighlightData } from '../types';
import ColorPicker from './ColorPicker';
import Confirmation from './Confirmation';
import Note from './Note';
import onClickOutside from './utils/onClickOutside';

interface Props {
  authenticated: boolean;
  book: ReturnType<typeof selectContent['bookAndPage']>['book'];
  loginLink: string;
  isFocused: boolean;
  highlight: Highlight;
  onCreate: () => void;
  onBlur: typeof clearFocusedHighlight;
  onSave: typeof updateHighlight;
  onRemove: () => void;
  onCancel: () => void;
  data?: HighlightData;
  className: string;
  services: AppServices;
}

// tslint:disable-next-line:variable-name
const EditCard = React.forwardRef<HTMLElement, Props>((
  {
    authenticated,
    book,
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
    services,
  }: Props,
  ref
) => {
  const defaultAnnotation = () => data && data.annotation ? data.annotation : '';
  const [pendingAnnotation, setPendingAnnotation] = React.useState<string>(defaultAnnotation());
  const [editingAnnotation, setEditing] = React.useState<boolean>(!!data && !!data.annotation);
  const [confirmingDelete, setConfirmingDelete] = React.useState<boolean>(false);
  const element = React.useRef<HTMLElement>(null);

  const blurIfNotEditing = () => {
    if (!editingAnnotation) {
      onBlur();
    }
  };

  React.useEffect(onClickOutside(element, isFocused, blurIfNotEditing), [isFocused, editingAnnotation]);

  const onColorChange = (color: HighlightColorEnum, flag?: boolean) => {
    services.analytics.createNote.track(book, flag ? 'default' : color);
    highlight.setStyle(color);
    if (data) {
      onSave({
        highlight: {
          annotation: data.annotation,
          color: color as string as HighlightUpdateColorEnum,
        },
        id: data.id,
      });
    } else {
      assertWindow().getSelection().removeAllRanges();
      onCreate();
    }
  };

  const saveAnnotation = (toSave: HighlightData) => {
    onSave({
      highlight: {
        annotation: pendingAnnotation,
        color: toSave.color as string as HighlightUpdateColorEnum,
      },
      id: toSave.id,
    });
    onCancel();
  };

  const cancelEditing = () => {
    setPendingAnnotation(defaultAnnotation());
    setEditing(false);
    onCancel();
  };

  return <form
    className={className}
    ref={mergeRefs(ref, element)}
    data-analytics-region='edit-note'
  >
    <ColorPicker color={data ? data.color : undefined} onChange={onColorChange} onRemove={() => {
      if ((!data || !data.annotation) && !pendingAnnotation) {
        onRemove();
      }
    }} />
    <Note
      note={pendingAnnotation}
      onFocus={() => {
        if (!highlight.getStyle()) {
          onColorChange(highlightStyles[0].label, true);
        }
      }}
      onChange={(newValue) => {
        setPendingAnnotation(newValue);
        setEditing(true);
      }}
    />
    {editingAnnotation && data && <ButtonGroup>
      <FormattedMessage id='i18n:highlighting:button:save'>
        {(msg: Element | string) => <Button
          data-testid='save'
          data-analytics-label='save'
          size='small'
          variant='primary'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            setEditing(false);

            if (pendingAnnotation === '' && data.annotation) {
              setConfirmingDelete(true);
            } else {
              saveAnnotation(data);
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
    {confirmingDelete && data && <Confirmation
      data-testid='confirm-delete'
      data-analytics-region='highlighting-delete-note'
      message='i18n:highlighting:confirmation:delete-note'
      confirmMessage='i18n:highlighting:button:delete'
      onConfirm={() => saveAnnotation(data)}
      onCancel={() => {
        setEditing(true);
        setPendingAnnotation(defaultAnnotation());
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

export default styled(withServices(EditCard))`
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
