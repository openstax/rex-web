import { HTMLElement } from '@openstax/types/lib.dom';
import { isUndefined, omitBy } from 'lodash';
import flow from 'lodash/fp/flow';
import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css, keyframes } from 'styled-components/macro';
import { useFocusLost } from '../reactUtils';
import { useOnEsc } from '../reactUtils';
import theme from '../theme';
import { preventDefault } from '../utils';
import { visuallyHidden, visuallyShown } from './styleHelpers';
import { textStyle } from './Typography/base';

type ComponentWithRef = React.ComponentType<{ref: React.RefObject<any>}>;
interface ToggleProps<T extends ComponentWithRef = ComponentWithRef> {
  className?: string;
  component: T extends React.ComponentType
    ? React.ReactComponentElement<T>:
    never;
}
// tslint:disable-next-line:variable-name
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

interface ControlledProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

interface Props {
  toggle: React.ReactNode;
  className?: string;
  onToggle?: () => void;
}

// tslint:disable-next-line:variable-name
const TabHiddenDropDown = styled((
  {toggle, children, className, onToggle, ...props}: React.PropsWithChildren<Props | Props & ControlledProps>
) => {
  const { open: controlledOpen, setOpen: controlledSetOpen } = props as Props & ControlledProps;
  const [open, setOpenState] = React.useState<boolean>(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setOpen = controlledSetOpen !== undefined ? controlledSetOpen : setOpenState;
  const container = React.useRef<HTMLElement>(null);
  const toggleElement = React.useRef<HTMLElement>(null);

  useFocusLost(container, isOpen, () => setOpen(false));
  useOnEsc(container, isOpen, () => {
    setOpen(false);
    if (toggleElement.current) { toggleElement.current.focus(); }
  });

  return <div className={className} ref={container}>
    <DropdownToggle
      ref={toggleElement}
      component={toggle}
      onClick={() => {
        setOpen(!isOpen);
        if (onToggle) { onToggle(); }
      }}
      isOpen={isOpen}
    />
    {(isOpen) && children}
  </div>;
})`
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

// tslint:disable-next-line:variable-name
export const DropdownFocusWrapper = styled.div`
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
const TabTransparentDropdown = styled((
  {toggle, children, className}: React.PropsWithChildren<Props>
) => <div className={className}>
  <DropdownFocusWrapper>
    <DropdownToggle tabIndex={0} component={toggle} />
    {children}
  </DropdownFocusWrapper>
  <DropdownToggle tabIndex={0} component={toggle} />
</div>)`
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

// tslint:disable-next-line:variable-name
export const DropdownList = styled.ol`
  margin: 0;
  padding: 0.6rem 0;
  background: ${theme.color.neutral.formBackground};

  li {
    display: inline-block;
  }

  li button,
  li a {
    text-decoration: none;
    display: flex;
    align-items: center;
    text-align: left;
    cursor: pointer;
    outline: none;
    border: none;
    padding: 0 0.8rem;
    margin: 0;
    height: 3.2rem;
    background: none;
    min-width: 7.2rem;
    ${textStyle}
    font-size: 1.4rem;
    line-height: 2rem;

    &:hover,
    &:focus {
      background: ${theme.color.neutral.formBorder};
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

// tslint:disable-next-line:variable-name
const DropdownItemContent = ({
  message, href, target, prefix, onClick, dataAnalyticsRegion, dataAnalyticsLabel,
}: Omit<DropdownItemProps, 'ariaMessage'>) => {
  const analyticsDataProps = omitBy({
    'data-analytics-label': dataAnalyticsLabel,
    'data-analytics-region': dataAnalyticsRegion,
  }, isUndefined);
  return <FormattedMessage id={message}>
    {(msg: Element | string) => href
      ? <a href={href} tabIndex={0} onClick={onClick} target={target} {...analyticsDataProps}>{prefix}{msg}</a>
      /*
        this should be a button but Safari and firefox don't support focusing buttons
        which breaks the tab transparent dropdown
        https://bugs.webkit.org/show_bug.cgi?id=22261
        https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus
      */
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      : <a
        tabIndex={0}
        href=''
        onClick={onClick ? flow(preventDefault, onClick) : preventDefault}
        {...analyticsDataProps}
      >
        {prefix}{msg}
      </a>
    }
  </FormattedMessage>;
};

// tslint:disable-next-line:variable-name
export const DropdownItem = ({ariaMessage, ...contentProps}: DropdownItemProps) => {
  return ariaMessage
    ? <FormattedMessage id={ariaMessage}>
      {(msg: string) => <li aria-label={msg}><DropdownItemContent {...contentProps}/></li>}
    </FormattedMessage>
    : <li><DropdownItemContent {...contentProps} /></li>;
};

interface CommonDropdownProps {
  transparentTab?: boolean;
}

type TabTransparentDropdownProps = CommonDropdownProps & Props;
export type TabHiddenDropdownProps = CommonDropdownProps & (Props | Props & ControlledProps);

// tslint:disable-next-line:variable-name
const Dropdown = ({transparentTab, ...props}: TabTransparentDropdownProps | TabHiddenDropdownProps) =>
  transparentTab !== false
    ? <TabTransparentDropdown {...props} />
    : <TabHiddenDropDown {...props} />;

export default styled(Dropdown)`
  overflow: visible;
  position: relative;
`;
