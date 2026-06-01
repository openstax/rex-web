import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button, { ButtonGroup } from '../../../components/Button';
import { useDrawFocus, useTrapTabNavigation, useOnEsc } from '../../../reactUtils';
import { mergeRefs } from '../../../utils';
import './Confirmation.css';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  'data-analytics-region'?: string;
  'data-analytics-label'?: string;
  confirmMessage: string;
  confirmLink?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  always?: () => void;
  drawFocus?: boolean;
}

const Confirmation = React.forwardRef<HTMLElement, Props>((
  { message, confirmMessage, confirmLink, always, onCancel, onConfirm, drawFocus = true, ...props }: Props,
  ref
) => {
  const drawFocusRef = useDrawFocus();
  const overlayRef = React.useRef<HTMLElement>(null);

  // Use drawFocusRef if drawFocus is true, otherwise use overlayRef for trap navigation
  const trapRef = drawFocus ? drawFocusRef : overlayRef;
  
  // Auto-focus first element when drawFocus=false (overlay case)
  useTrapTabNavigation(trapRef, undefined, !drawFocus);
  useOnEsc(true, onCancel);

  return <div
    {...props}
    className="confirmation-overlay"
    ref={mergeRefs(ref, drawFocus ? drawFocusRef : overlayRef)}
    tabIndex={-1}
    role='alertdialog'
  >
    <FormattedMessage id={message}>
      {(msg) => <label>{msg}</label>}
    </FormattedMessage>
    <ButtonGroup>
      <FormattedMessage id={confirmMessage}>
        {(msg) => <Button
          size='small'
          data-analytics-label={props['data-analytics-label'] ? props['data-analytics-label'] : 'confirm'}
          data-testid='confirm'
          variant='primary'
          onClick={(e: React.FormEvent) => {
            if (!confirmLink) {
              e.preventDefault();
            }
            if (onConfirm) {
              onConfirm();
            }
            if (always) {
              always();
            }
          }}
          {...confirmLink
            // eslint-disable-next-line
            ? { component: <a href={confirmLink} /> }
            : {}
          }
        >{msg}</Button>}
      </FormattedMessage>
      <FormattedMessage id='i18n:highlighting:button:cancel'>
        {(msg) => <Button
          size='small'
          data-analytics-label='cancel'
          data-testid='cancel'
          onClick={(e: React.FormEvent) => {
            e.preventDefault();
            onCancel();
            if (always) {
              always();
            }
          }}
        >{msg}</Button>}
      </FormattedMessage>
    </ButtonGroup>
  </div>;
});

export default Confirmation;
