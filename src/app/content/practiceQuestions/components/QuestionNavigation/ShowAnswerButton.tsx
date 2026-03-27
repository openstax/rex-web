import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../../../components/Button';

interface ShowAnswerButtonProps {
  onClick: () => void;
}

const ShowAnswerButton = React.forwardRef<HTMLButtonElement, ShowAnswerButtonProps>((
  { onClick },
  ref
) => {
  return <FormattedMessage id='i18n:practice-questions:popup:navigation:show-answer:after-submit-incorrect:aria-label'>
    {(ariaLabel: string) => <FormattedMessage id='i18n:practice-questions:popup:navigation:show-answer'>
      {(msg) => (
        <Button
          ref={ref}
          size='large'
          variant='transparent'
          aria-label={ariaLabel}
          data-testid='show-answer'
          data-analytics-label='Show answer'
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            onClick();
          }}
        >
          {msg}
        </Button>
      )}
    </FormattedMessage>}
  </FormattedMessage>;
});

export default ShowAnswerButton;
