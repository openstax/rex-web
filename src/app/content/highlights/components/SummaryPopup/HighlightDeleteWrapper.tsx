import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import Button from '../../../../components/Button';
import { textStyle } from '../../../../components/Typography';
import { HighlightEditButtons } from './styles';

// tslint:disable-next-line:variable-name
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
  onCancel: () => void;
  onDelete: () => void;
}

// tslint:disable-next-line:variable-name
const HighlightDeleteWrapper = ({
  onDelete,
  onCancel,
}: HighlightDeleteWrapperProps) => <StyledHighlightDeleteWrapper>
  <FormattedMessage id='i18n:highlighting:confirmation:delete-both'>
    {(msg: string) => <span>{msg}</span>}
  </FormattedMessage>
  <HighlightEditButtons>
    <FormattedMessage id='i18n:highlighting:button:delete'>
      {(msg: Element | string) => <Button
        data-testid='delete'
        data-analytics-label='delete'
        size='medium'
        variant='primary'
        onClick={onDelete}
      >{msg}</Button>}
    </FormattedMessage>
    <FormattedMessage id='i18n:highlighting:button:cancel'>
      {(msg: Element | string) => <Button
        size='medium'
        data-analytics-label='cancel'
        data-testid='cancel'
        onClick={onCancel}
      >{msg}</Button>}
    </FormattedMessage>
  </HighlightEditButtons>
</StyledHighlightDeleteWrapper>;

export default HighlightDeleteWrapper;
