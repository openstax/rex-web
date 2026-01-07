import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import Button from '../../../../components/Button';
import { textStyle } from '../../../../components/Typography';
import { useDrawFocus, useTrapTabNavigation } from '../../../../reactUtils';
import { HighlightEditButtons } from './styles';

const StyledHighlightDeleteWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);

  span {
    ${textStyle}
    font-size: 16px;
    font-weight: 500;
    line-height: 25px;
    letter-spacing: -0.2;
    color: #fff;
    margin-right: 8px;
  }
`;

interface HighlightDeleteWrapperProps {
  deletingWhat?: 'note' | 'highlight' | 'both';
  onCancel: () => void;
  onDelete: () => void;
}

function HighlightDeleteWrapper({
  deletingWhat = 'highlight',
  onDelete,
  onCancel,
}: HighlightDeleteWrapperProps) {
  const ref = useDrawFocus();

  useTrapTabNavigation(ref);

  return (
    <StyledHighlightDeleteWrapper
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
    </StyledHighlightDeleteWrapper>
  );
}

export default HighlightDeleteWrapper;
