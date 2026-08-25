import React from 'react';
import { useIntl } from 'react-intl';
import classNames from 'classnames';
import { PlainButton } from '../../../components/Button';
import Dropdown, { TabHiddenDropdownProps } from '../../../components/Dropdown';
import './Filters.css';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * Angle down icon for filter dropdowns.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 */
function AngleDownIcon({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"
      />
    </svg>
  );
}

interface AngleIconProps extends IconProps {
  direction: 'up' | 'down';
}

export const AngleIcon = ({ className, direction, ...props }: AngleIconProps) => (
  <AngleDownIcon
    className={classNames('filters-angle-icon', { 'filters-angle-icon-up': direction === 'up' }, className)}
    {...props}
  />
);

export const Fieldset = ({ className, ...props }: React.FieldsetHTMLAttributes<HTMLFieldSetElement>) => (
  <fieldset className={classNames('filters-fieldset', className)} {...props} />
);

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  showLabel?: boolean;
  toggleChildren?: JSX.Element;
  isOpen?: boolean;
  ariaLabelId: string;
  showAngleIcon?: boolean;
  controlsId: string;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      label,
      isOpen,
      ariaLabelId,
      showAngleIcon = true,
      showLabel = true,
      toggleChildren,
      controlsId,
      ...props
    },
    ref
  ) => (
    <PlainButton
      ref={ref}
      {...props}
      className={classNames('filters-toggle', { 'filters-toggle-open': isOpen }, className)}
      aria-label={useIntl().formatMessage(
        { id: ariaLabelId },
        { filter: label }
      )}
      aria-expanded={isOpen}
      aria-controls={controlsId}
    >
      <div tabIndex={-1}>
        {showLabel && label}
        {toggleChildren}
        {showAngleIcon && <AngleIcon direction={isOpen ? 'up' : 'down'} />}
      </div>
    </PlainButton>
  )
);

type FilterDropdownProps = {
  label: string;
  showLabel?: boolean;
  ariaLabelId: string;
  dataAnalyticsLabel: string;
  showAngleIcon?: boolean;
  toggleChildren?: JSX.Element;
  controlsId: string;
} & Partial<TabHiddenDropdownProps>;

export const FilterDropdown = ({label, showLabel, ariaLabelId, dataAnalyticsLabel, toggleChildren, children, ...props}:
React.PropsWithChildren<FilterDropdownProps>) => (
  <Dropdown
    toggle={<Toggle
      label={useIntl().formatMessage({ id: label })}
      showLabel={showLabel}
      toggleChildren={toggleChildren}
      ariaLabelId={ariaLabelId}
      data-analytics-label={dataAnalyticsLabel}
      showAngleIcon={props.showAngleIcon}
      controlsId={props.controlsId} />}
    transparentTab={false}
    {...props}
  >
    {children}
  </Dropdown>
);

export const FiltersTopBar = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('popup-filters-top-bar', className)} {...props} />
);

interface Props {
  className?: string;
}

const Filters = ({className, children}: React.PropsWithChildren<Props>) => {
  return <div className={classNames('popup-filters', className)}>
    {children}
  </div>;
};

export default Filters;
