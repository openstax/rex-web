import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../../components/Button';

// tslint:disable-next-line: variable-name
const FinishButton = () => {
  return <FormattedMessage id='i18n:practice-questions:popup:navigation:finish'>
    {(msg: string) => <Button
      variant='primary'
      size='large'
      data-analytics-label='Finish'
      type='submit'
    >
      {msg}
    </Button>}
  </FormattedMessage>;
};

export default FinishButton;
