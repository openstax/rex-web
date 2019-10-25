import { HTMLElement } from '@openstax/types/lib.dom';
import Color from 'color';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button, { ButtonGroup } from '../../../components/Button';
import { labelStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { cardPadding } from '../constants';
import { cardBorder } from './style';

// tslint:disable-next-line:variable-name
export const Overlay = styled.div`
  background: ${Color(theme.color.black).alpha(0.90).string()};
  outline: none;
  ${cardBorder}
  transition: background 200ms;
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: ${cardPadding}rem 1.6rem;
  top: 0;
  right: 0;
  left: 0;
  overflow: visible;
  min-height: 100%;

  label {
    ${labelStyle}
    color: ${theme.color.text.white};
    margin-bottom: ${cardPadding}rem;
  }
`;

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  always?: () => void;
}

// tslint:disable-next-line:variable-name
const Confirmation = ({message, always, onCancel, onConfirm}: Props) => {
  const overlayElement = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (overlayElement.current) {
      overlayElement.current.focus();
    }
  }, []);

  return <Overlay ref={overlayElement} tabIndex={-1}>
    <FormattedMessage id={message}>
      {(msg: Element | string) => <label>{msg}</label>}
    </FormattedMessage>
    <ButtonGroup>
      <Button size='small' variant='primary' onClick={(e: React.FormEvent) => {
        e.preventDefault();
        onConfirm();
        if (always) {
          always();
        }
      }}>Save</Button>
      <Button size='small' onClick={(e: React.FormEvent) => {
        e.preventDefault();
        onCancel();
        if (always) {
          always();
        }
      }}>Cancel</Button>
    </ButtonGroup>
  </Overlay>;
};

export default Confirmation;
