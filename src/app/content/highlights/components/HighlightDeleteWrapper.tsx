import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../components/Button';
import * as Styled from './ShowMyHighlightsStyles';

interface HighlightDeleteWrapperProps {
  onCancel: () => void;
  onDelete: () => void;
}

// tslint:disable-next-line:variable-name
const HighlightDeleteWrapper = ({
  onDelete,
  onCancel,
}: HighlightDeleteWrapperProps) => <Styled.HighlightDeleteWrapper>
  <FormattedMessage id='i18n:highlighting:confirmation:delete-both'>
    {(msg: string) => <span>{msg}</span>}
  </FormattedMessage>
  <Styled.HighlightEditButtons>
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
  </Styled.HighlightEditButtons>
</Styled.HighlightDeleteWrapper>;

export default HighlightDeleteWrapper;
