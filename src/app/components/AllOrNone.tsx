import React from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { ButtonLink } from './Button';
import './AllOrNone.css';

interface Props {
  className?: string;
  onAll: () => void;
  onNone: () => void;
  disabled?: boolean;
}

export default function AllOrNone({ className, onAll, onNone, disabled }: Props) {
  return (
    <div className={classNames('all-or-none', className)}>
      <FormattedMessage id='i18n:highlighting:filters:all'>
        {(msg) => <ButtonLink disabled={disabled} decorated onClick={onAll}>{msg}</ButtonLink>}
      </FormattedMessage>
      <span aria-hidden="true">|</span>
      <FormattedMessage id='i18n:highlighting:filters:none'>
        {(msg) => <ButtonLink disabled={disabled} decorated onClick={onNone}>{msg}</ButtonLink>}
      </FormattedMessage>
    </div>
  );
}
