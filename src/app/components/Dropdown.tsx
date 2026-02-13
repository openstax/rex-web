
import { HTMLElement, HTMLMenuElement } from '@openstax/types/lib.dom';
import flow from 'lodash/fp/flow';
import isUndefined from 'lodash/fp/isUndefined';
import omitBy from 'lodash/fp/omitBy';
import React, { ReactNode } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import styled, { css, keyframes } from 'styled-components/macro';
import { useFocusLost, useTrapTabNavigation, focusableItemQuery } from '../reactUtils';
import { useOnEsc } from '../reactUtils';
import theme, { defaultFocusOutline } from '../theme';
import { mergeRefs, preventDefault } from '../utils';
import { textStyle } from './Typography/base';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentWithRef = React.ComponentType<{ref: React.RefObject<any>}>;
interface ToggleProps<T extends ComponentWithRef = ComponentWithRef> {
  className?: string;
  isOpen?: boolean;
  component: T extends React.ComponentType
    ? React.ReactComponentElement<T>:
    never;
}
export const DropdownToggle = styled(React.forwardRef<HTMLElement, ToggleProps>(
  ({component, ...props}, ref) => React.cloneElement(component, {...props, ref})
))`
  cursor: pointer;
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

const fadeInAnimation = css`
  animation: ${100}ms ${fadeIn} ease-out;
`;

const visuallyShown = css`
  height: unset;
  width: unset;
  clip: unset;
  overflow: visible;
`;

const visuallyHidden = css`
  height: 0;
  width: 0;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
`;

interface ControlledProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

interface Props {
  toggle: React.ReactNode;
  className?: string;
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

const TabHiddenDropDown = styled(React.forwardRef<HTMLElement, TabHiddenProps>((
  {toggle, children, className, onToggle, ...props}, ref
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
    {(isOpen) && children}
  </div>;
}))`
  ${css`
    & > *:not(${DropdownToggle}) {
      ${fadeInAnimation}
      position: absolute;
      box-shadow: 0 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.1);
      border: 1px solid ${theme.color.neutral.formBorder};
      top: calc(100% + 0.4rem);
      left: 0;
    }
  `}
`;

export const DropdownFocusWrapper = styled.div`
  overflow: visible;
`;

const TabTransparentDropdown = styled(React.forwardRef<HTMLElement, React.PropsWithChildren<Props>>((
  {toggle, children, className}, ref
) => <div className={className} ref={ref}>
  <DropdownFocusWrapper>
    <DropdownToggle tabIndex={0} component={toggle} />
    {children}
  </DropdownFocusWrapper>
  <DropdownToggle tabIndex={0} component={toggle} />
</div>))`
  ${/* i don't know why stylelint was complaining about this but it was, css wrapper suppresses */ css`
    ${DropdownFocusWrapper} + ${DropdownToggle} {
      ${visuallyHidden}
    }
    ${DropdownFocusWrapper}.focus-within + ${DropdownToggle} {
      ${visuallyShown}
    }
    ${DropdownFocusWrapper}:focus-within + ${DropdownToggle} {
      ${visuallyShown}
    }

    ${DropdownFocusWrapper} > ${DropdownToggle} {
      ${visuallyShown}
    }
    ${DropdownFocusWrapper}.focus-within > ${DropdownToggle} {
      ${visuallyHidden}
    }
    ${DropdownFocusWrapper}:focus-within > ${DropdownToggle} {
      ${visuallyHidden}
    }

    ${DropdownFocusWrapper} > *:not(${DropdownToggle}) {
      ${fadeInAnimation}
      position: absolute;
      box-shadow: 0 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.1);
      border: 1px solid ${theme.color.neutral.formBorder};
      top: calc(100% + 0.4rem);
      left: 0;
    }

    ${DropdownFocusWrapper} > *:not(${DropdownToggle}) {
      ${visuallyHidden}
    }

    ${DropdownFocusWrapper}.focus-within > *:not(${DropdownToggle}) {
      ${visuallyShown}
    }

    ${DropdownFocusWrapper}:focus-within > *:not(${DropdownToggle}) {
      ${visuallyShown}
    }
  `}
`;

function TrappingDropdownList(props: object) {
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


export const DropdownList = styled(TrappingDropdownList)`
  list-style: none;
  margin: 0;
  padding: 0.6rem 0;
  background: ${theme.color.neutral.formBackground};
  z-index: 1;

  li {
    padding: 0.2rem;
  }

  li button,
  li a {
    white-space: nowrap;
    text-decoration: none;
    display: flex;
    align-items: center;
    text-align: left;
    cursor: pointer;
    outline: none;
    border: none;
    padding-left: 0.8rem;
    margin: 0;
    height: 3rem;
    background: none;
    min-width: 7rem;
    ${textStyle}
    font-size: 1.4rem;
    line-height: 2rem;

    &:focus {
      background: ${theme.color.neutral.formBorder};
      ${defaultFocusOutline}
    }
  }
`;


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
    {(msg: string) => href
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
}

type TabTransparentDropdownProps = CommonDropdownProps & Props;
export type TabHiddenDropdownProps = CommonDropdownProps & (Props | Props & ControlledProps);

export type DropdownProps = TabTransparentDropdownProps | TabHiddenDropdownProps;

const Dropdown = React.forwardRef<HTMLElement, DropdownProps>(({transparentTab, ...props}, ref) =>
  transparentTab !== false
    ? <TabTransparentDropdown ref={ref} {...props} />
    : <TabHiddenDropDown ref={ref} {...props} />
);

export default styled(Dropdown)`
  overflow: visible;
  position: relative;
`;
