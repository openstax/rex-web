import { HTMLElement } from '@openstax/types/lib.dom';
import Color from 'color';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button, { ButtonGroup } from '../../../components/Button';
import { labelStyle } from '../../../components/Typography';
import { useDrawFocus, useTrapTabNavigation } from '../../../reactUtils';
import theme from '../../../theme';
import { mergeRefs } from '../../../utils';
import { cardPadding } from '../constants';
import { cardBorder } from './style';

export const Overlay = styled.div`
  background: ${Color(theme.color.black).alpha(0.90).string()};
  outline: none;
  ${cardBorder}
  transition: background 200ms;
  display: flex;
  flex-direction: column;
  padding: 1.6rem;
  overflow: visible;
  min-height: 100%;
  min-width: 100%;
  position: static;
  width: min-content;

  label {
    ${labelStyle}
    flex: 1;
    color: ${theme.color.text.white};
    margin-bottom: ${cardPadding}rem;
    overflow: visible;
  }
`;

interface Props {
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
  {message, confirmMessage, confirmLink, always, onCancel, onConfirm, drawFocus = true, ...props}: Props,
  ref
) => {
  const drawFocusRef = useDrawFocus();

  useTrapTabNavigation(drawFocusRef);

  return <Overlay
    ref={mergeRefs(ref, drawFocus ? drawFocusRef : null)}
    tabIndex={-1}
    role='alertdialog'
    {...props['data-analytics-region']
      ? {'data-analytics-region': props['data-analytics-region']}
      : {}
    }
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
            ? {component: <a href={confirmLink} />}
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
  </Overlay>;
});

export default Confirmation;
