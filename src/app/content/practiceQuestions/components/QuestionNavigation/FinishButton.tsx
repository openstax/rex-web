import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../../components/Button';

const FinishButton = () => {
  return <FormattedMessage id='i18n:practice-questions:popup:navigation:finish'>
    {(msg) => <Button
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
