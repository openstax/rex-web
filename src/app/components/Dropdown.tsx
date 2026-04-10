
import { HTMLDivElement, HTMLElement, HTMLMenuElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import isUndefined from 'lodash/fp/isUndefined';
import omitBy from 'lodash/fp/omitBy';
import React, { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import classNames from 'classnames';
import { useFocusLost, useTrapTabNavigation, focusableItemQuery } from '../reactUtils';
import { useOnEsc } from '../reactUtils';
import { mergeRefs, preventDefault } from '../utils';
import './Dropdown.css';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentWithRef = React.ComponentType<{ref: React.RefObject<any>}>;
interface ToggleProps<T extends ComponentWithRef = ComponentWithRef> {
  className?: string;
  component: T extends React.ComponentType
    ? React.ReactComponentElement<T>:
    never;
  // Allow any additional props to be passed through (including onClick, isOpen, etc.)
  [key: string]: unknown;
}

// Plain React component for DropdownToggle, but wrapped with styled() for backward compatibility
const DropdownToggleBase = React.forwardRef<HTMLElement, ToggleProps>(
  ({component, className, ...props}, ref) => {
    return React.cloneElement(component, {
      ...props,
      className: classNames('dropdown-toggle', className),
      ref,
    });
  }
);

// Wrap with styled() for backward compatibility with component selectors
export const DropdownToggle = styled(DropdownToggleBase)``;

// Plain div for DropdownFocusWrapper
export const DropdownFocusWrapper = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={classNames('dropdown-focus-wrapper', className)} {...props}>
    {children}
  </div>
);

interface ControlledProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

interface Props {
  toggle: React.ReactNode;
  className?: string;
  menuClassName?: string;
  onToggle?: () => void;
}

function useIsOpen(props: {open?: boolean, setOpen?: ControlledProps['setOpen']}) {
  const { open: controlledOpen, setOpen: controlledSetOpen } = props;
  const [open, setOpenState] = React.useState<boolean>(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setOpen = controlledSetOpen !== undefined ? controlledSetOpen : setOpenState;

  return {isOpen, setOpen};
}

// Safari always registers loss of focus on a mousedown, even when it's on a
// focusable element in the same container. If that happens, just restore focus
// to the toggleElement so it's still listening for a real loss of focus.
export function callOrRefocus(
  cb: () => void,
  containerEl: HTMLElement | null,
  toggleEl: HTMLElement | null
) {
  if (containerEl?.matches(':hover')) {
    toggleEl?.focus();
  } else {
    cb();
  }
}

type TabHiddenProps = React.PropsWithChildren<Props | Props & ControlledProps>;

// Plain React component for TabHiddenDropDown
const TabHiddenDropDown = React.forwardRef<HTMLElement, TabHiddenProps>((
  {toggle, children, className, menuClassName, onToggle, ...props}, ref
) => {
  const {isOpen, setOpen} = useIsOpen(props);
  const container = React.useRef<HTMLElement>(null);
  const toggleElement = React.useRef<HTMLElement>(null);
  const onFocusLost = React.useCallback(
    () => callOrRefocus(
      () => setOpen(false),
      container.current,
      toggleElement.current
    ), [setOpen]);

  useFocusLost(container, isOpen, onFocusLost);
  useOnEsc(isOpen, () => {
    setOpen(false);
    if (toggleElement.current) { toggleElement.current.focus(); }
  });

  return <div className={className} ref={mergeRefs(ref, container)}>
    <DropdownToggle
      ref={toggleElement}
      component={toggle}
      onClick={() => {
        setOpen(!isOpen);
        onToggle?.();
      }}
      isOpen={isOpen}
    />
    {(isOpen) && <div className={classNames('dropdown-menu', menuClassName)}>{children}</div>}
  </div>;
});

// Plain React component for TabTransparentDropdown
const TabTransparentDropdown = React.forwardRef<HTMLElement, React.PropsWithChildren<Props>>((
  {toggle, children, className, menuClassName}, ref
) => {
  const [isFocusWithin, setIsFocusWithin] = React.useState(false);

  const handleFocusIn = React.useCallback(() => {
    setIsFocusWithin(true);
  }, []);

  const handleFocusOut = React.useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    // Check if the new focus target is still within this element
    const currentTarget = e.currentTarget as HTMLDivElement;
    if (!e.relatedTarget || !currentTarget.contains(e.relatedTarget as HTMLElement)) {
      setIsFocusWithin(false);
    }
  }, []);

  return <div className={classNames('dropdown-transparent', className)} ref={ref}>
    <DropdownFocusWrapper
      className={classNames({ 'focus-within': isFocusWithin })}
      onFocus={handleFocusIn}
      onBlur={handleFocusOut}
    >
      <DropdownToggle tabIndex={0} component={toggle} />
      <div className={classNames('dropdown-menu', menuClassName)}>{children}</div>
    </DropdownFocusWrapper>
    <DropdownToggle className="dropdown-toggle-second" tabIndex={0} component={toggle} />
  </div>;
});

function TrappingDropdownList(props: React.MenuHTMLAttributes<HTMLMenuElement>) {
  const ref = React.useRef<HTMLMenuElement>(null);

  useTrapTabNavigation(ref);

  React.useEffect(
    () => {
      if (ref.current?.querySelector) {
        ref.current?.querySelector<HTMLElement>(focusableItemQuery)?.focus();
      }
    },
    []
  );

  return (
    <menu ref={ref} {...props} />
  );
}

// Plain React component for DropdownList, but wrapped with styled() for backward compatibility
const DropdownListBase = ({ className, ...props }: React.MenuHTMLAttributes<HTMLMenuElement>) => {
  return <TrappingDropdownList className={classNames('dropdown-list', className)} {...props} />;
};

// Wrap with styled() for backward compatibility with component selectors
export const DropdownList = styled(DropdownListBase)``;

interface DropdownItemProps {
  message: string;
  ariaMessage?: string;
  href?: string;
  target?: string;
  prefix?: ReactNode;
  onClick?: () => void;
  dataAnalyticsRegion?: string;
  dataAnalyticsLabel?: string;
}

const DropdownItemContent = ({
  message, href, target, prefix, onClick, dataAnalyticsRegion, dataAnalyticsLabel,
}: Omit<DropdownItemProps, 'ariaMessage'>) => {
  const analyticsDataProps = omitBy(isUndefined, {
    'data-analytics-label': dataAnalyticsLabel,
    'data-analytics-region': dataAnalyticsRegion,
  });
  const focusMe = React.useCallback(
    ({target: me}) => me.focus(),
    []
  );

return <FormattedMessage id={message}>
    {(msg) => href
      ? <a
        role='button'
        href={href}
        tabIndex={0}
        onClick={onClick}
        target={target}
        onMouseEnter={focusMe}
        {...analyticsDataProps}
      >{prefix}{msg}</a>
      // Safari support tab-navigation of buttons; this operates with space or Enter
      : <button
        type='button'
        tabIndex={0}
        onClick={onClick ? flow(preventDefault, onClick) : preventDefault}
        onMouseEnter={focusMe}
        {...analyticsDataProps}
      >
        {prefix}{msg}
      </button>
    }
  </FormattedMessage>;
};

export const DropdownItem = ({ariaMessage, ...contentProps}: DropdownItemProps) => {
  const intl = useIntl();

  return <li aria-label={ariaMessage ? intl.formatMessage({id: ariaMessage}) : undefined}>
    <DropdownItemContent {...contentProps}/>
  </li>;
};

interface CommonDropdownProps {
  transparentTab?: boolean;
  children?: React.ReactNode;
}

type TabTransparentDropdownProps = CommonDropdownProps & Props;
export type TabHiddenDropdownProps = CommonDropdownProps & (Props | Props & ControlledProps);

export type DropdownProps = TabTransparentDropdownProps | TabHiddenDropdownProps;

const DropdownBase = React.forwardRef<HTMLElement, DropdownProps>(({transparentTab, ...props}, ref) =>
  transparentTab !== false
    ? <TabTransparentDropdown ref={ref} {...props} />
    : <TabHiddenDropDown ref={ref} {...props} />
);

const Dropdown = styled(DropdownBase)<DropdownProps>`
  overflow: visible;
  position: relative;
`;

export default Dropdown;
