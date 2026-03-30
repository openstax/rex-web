import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { disablePrintClass } from '../content/components/utils/disablePrint';
import { PlainButton } from './Button';
import theme from '../theme';
import './GoToTopButton.css';

/**
 * Icon component for the "scroll to top" button.
 * SVG path from Font Awesome Free 5.15.4 (https://fontawesome.com - MIT License)
 */
export function GoToTopIcon({ className, ...props }: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      className={classNames('go-to-top-icon', className)}
      viewBox="0 0 320 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M177 159.7l136 136c9.4 9.4 9.4 24.6 0 33.9l-22.6 22.6c-9.4 9.4-24.6 9.4-33.9 0L160 255.9l-96.4 96.4c-9.4 9.4-24.6 9.4-33.9 0L7 329.7c-9.4-9.4-9.4-24.6 0-33.9l136-136c9.4-9.5 24.6-9.5 34-.1z"
      />
    </svg>
  );
}

interface GoToTopButtonProps extends Omit<React.ComponentPropsWithoutRef<typeof PlainButton>, 'aria-label' | 'onClick' | 'className'> {
  i18nAriaLabel: string;
  onClick: () => void;
  className?: string;
}

const GoToTopButton = ({ i18nAriaLabel, onClick, className, ...rest }: GoToTopButtonProps) => {
  const intl = useIntl();

  return (
    <PlainButton
      className={classNames('go-to-top-wrapper', disablePrintClass, className)}
      onClick={onClick}
      aria-label={intl.formatMessage({id: i18nAriaLabel})}
      type="button"
      {...rest}
    >
      <div
        className="go-to-top-circle"
        style={{
          '--go-to-top-bg': theme.color.primary.gray.light,
        } as React.CSSProperties}
      >
        <GoToTopIcon />
      </div>
    </PlainButton>
  );
};

export default GoToTopButton;
