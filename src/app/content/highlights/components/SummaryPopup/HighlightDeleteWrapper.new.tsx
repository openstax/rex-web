import classNames from 'classnames';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../../components/Button';
import { useDrawFocus, useTrapTabNavigation } from '../../../../reactUtils';
import { HighlightEditButtons } from './styles';
import './HighlightDeleteWrapper.css';

interface HighlightDeleteWrapperProps {
  deletingWhat?: 'note' | 'highlight' | 'both';
  onCancel: () => void;
  onDelete: () => void;
  className?: string;
}

/**
 * HighlightDeleteWrapper - Confirmation dialog for deleting highlights/notes
 */
export function HighlightDeleteWrapper({
  deletingWhat = 'highlight',
  onDelete,
  onCancel,
  className,
}: HighlightDeleteWrapperProps) {
  const ref = useDrawFocus();

  useTrapTabNavigation(ref);

  return (
    <div
      className={classNames('highlight-delete-wrapper', className)}
      data-analytics-region='MH delete'
      tabIndex={0}
      ref={ref}
    >
      <FormattedMessage
        id={
          deletingWhat === 'both'
            ? 'i18n:highlighting:confirmation:delete-both'
            : deletingWhat === 'highlight' ? 'i18n:highlighting:confirmation:delete-highlight'
            : 'i18n:highlighting:confirmation:delete-note'
        }
      >
        {msg => <span>{msg}</span>}
      </FormattedMessage>
      <HighlightEditButtons>
        <FormattedMessage id='i18n:highlighting:button:delete'>
          {msg => (
            <Button
              autoFocus
              data-testid='delete'
              data-analytics-label='delete'
              size='medium'
              variant='primary'
              onClick={onDelete}
            >
              {msg}
            </Button>
          )}
        </FormattedMessage>
        <FormattedMessage id='i18n:highlighting:button:cancel'>
          {msg => (
            <Button
              size='medium'
              data-analytics-label='cancel'
              data-testid='cancel'
              onClick={onCancel}
            >
              {msg}
            </Button>
          )}
        </FormattedMessage>
      </HighlightEditButtons>
    </div>
  );
}

export default HighlightDeleteWrapper;
