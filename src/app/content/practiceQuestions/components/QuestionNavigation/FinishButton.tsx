import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../../components/Button';

// tslint:disable-next-line: variable-name
const FinishButton = () => {
  return <FormattedMessage id='i18n:practice-questions:popup:navigation:finish'>
    {(msg: string) => <Button
      variant='primary'
      size='large'
      value={msg}
      data-analytics-label='Finish'
      component={<input type='submit' />}
    />}
  </FormattedMessage>;
};

export default FinishButton;
