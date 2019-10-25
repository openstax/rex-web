import Color from 'color';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button, { ButtonGroup } from '../../../components/Button';
import { labelStyle } from '../../../components/Typography';
import theme from '../../../theme';

// tslint:disable-next-line:variable-name
export const Overlay = styled.div`
  background: ${Color(theme.color.black).alpha(0.90).string()};
  transition: background 200ms;
  position: absolute;
  display: flex;
  flex-direction: column;
  padding: 0.8rem 1.6rem;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;

  label {
    ${labelStyle}
    color: ${theme.color.text.white};
  }
`;

interface Props {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  always: () => void;
}

// tslint:disable-next-line:variable-name
const Confirmation = ({message, always, onCancel, onConfirm}: Props) => <Overlay>
  <FormattedMessage id={message}>
    {(msg: Element | string) => <label>{msg}</label>}
  </FormattedMessage>
  <ButtonGroup>
    <Button size='small' variant='primary' onClick={(e: React.FormEvent) => {
      e.preventDefault();
      onConfirm();
      always();
    }}>Save</Button>
    <Button size='small' onClick={(e: React.FormEvent) => {
      e.preventDefault();
      onCancel();
      always();
    }}>Cancel</Button>
  </ButtonGroup>
</Overlay>;

export default Confirmation;
