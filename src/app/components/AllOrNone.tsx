import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { AnyStyledComponent } from 'styled-components/macro';
import { ButtonLink } from './Button';

interface Props {
  className?: string;
  onAll: () => void;
  onNone: () => void;
  disabled?: boolean;
}

const AllOrNone = ({className, onAll, onNone, disabled}: Props) => <div className={className}>
  <FormattedMessage id='i18n:highlighting:filters:all'>
    {(msg: string) => <ButtonLink disabled={disabled} decorated onClick={onAll}>{msg}</ButtonLink>}
  </FormattedMessage>
  <span aria-hidden="true">|</span>
  <FormattedMessage id='i18n:highlighting:filters:none'>
    {(msg: string) => <ButtonLink disabled={disabled} decorated onClick={onNone}>{msg}</ButtonLink>}
  </FormattedMessage>
</div>;

export default styled(AllOrNone as AnyStyledComponent)`
  &,
  ${ButtonLink} {
    font-size: 1.4rem;
    overflow: visible;
  }

  height: 2rem;
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    padding: 0 1rem;
  }
`;
