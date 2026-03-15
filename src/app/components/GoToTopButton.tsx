import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { disablePrintClass } from '../content/components/utils/disablePrint';
import { PlainButton } from './Button';
import theme from '../theme';
import './GoToTopButton.css';

/**
 * Icon component for the "scroll to top" button.
 * SVG path from Font Awesome Free angle-up icon (https://fontawesome.com - MIT License)
 */
export function GoToTopIcon({ className, ...props }: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      className={classNames('go-to-top-icon', className)}
      viewBox="0 0 384 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M352 352c-8.188 0-16.38-3.125-22.62-9.375L192 205.3l-137.4 137.4c-12.5 12.5-32.75 12.5-45.25 0s-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0l160 160c12.5 12.5 12.5 32.75 0 45.25C368.4 348.9 360.2 352 352 352z"
      />
    </svg>
  );
}

interface GoToTopButtonProps {
  i18nAriaLabel: string;
  onClick: () => void;
  [key: string]: unknown;
}

const GoToTopButton = ({ i18nAriaLabel, onClick, ...rest }: GoToTopButtonProps) => {
  const intl = useIntl();

  return (
    <PlainButton
      className={classNames('go-to-top-wrapper', disablePrintClass)}
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
