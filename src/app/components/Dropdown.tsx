import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css, keyframes } from 'styled-components/macro';
import theme from '../theme';
import { textStyle } from './Typography/base';

interface ToggleProps<T extends React.ComponentType = React.ComponentType> {
  className?: string;
  component: T extends React.ComponentType
    ? React.ReactComponentElement<T>:
    never;
}
// tslint:disable-next-line:variable-name
const DropdownToggle = styled(({component, ...props}: ToggleProps) => React.cloneElement(component, props))`
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

const shown = (props: Props) => props.transparentTab
  ? visuallyShown
  : css`
    display: block;
  `
;
const hidden = (props: Props) => props.transparentTab
  ? visuallyHidden
  : css`
    display: none;
  `
;

type Props = React.PropsWithChildren<{
  toggle: React.ReactNode;
  className?: string;
  transparentTab?: boolean;
}>;

// tslint:disable-next-line:variable-name
const DropdownFocusWrapper = styled.div`
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
const DropdownContainer = styled(({transparentTab, toggle, children, className}: Props) => <div className={className}>
  <DropdownFocusWrapper>
    <DropdownToggle tabIndex={transparentTab === false ? 0 : -1} component={toggle} />
    {children}
  </DropdownFocusWrapper>
  <DropdownToggle tabIndex='-1' component={toggle} />
</div>)`
  overflow: visible;
  position: relative;
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
  `}

  ${DropdownFocusWrapper} > *:not(${DropdownToggle}) {
    ${fadeInAnimation}
    ${hidden}
    position: absolute;
    box-shadow: 0 0.5rem 0.5rem 0 rgba(0, 0, 0, 0.1);
    border: 1px solid ${theme.color.neutral.formBorder};
    top: calc(100% + 0.4rem);
    left: 0;
  }
  ${DropdownFocusWrapper}.focus-within > *:not(${DropdownToggle}) {
    ${shown}
  }
  ${DropdownFocusWrapper}:focus-within > *:not(${DropdownToggle}) {
    ${shown}
  }
`;

// tslint:disable-next-line:variable-name
export const DropdownList = styled.ol`
  margin: 0;
  padding: 0.6rem 0;
  background: ${theme.color.neutral.formBackground};

  li button,
  li a {
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

// tslint:disable-next-line:variable-name
export const DropdownItem = ({message, href, onClick}: {message: string, href?: string, onClick?: () => void}) => <li>
  <FormattedMessage id={message}>
    {(msg: Element | string) => href
      ? <a href={href} onClick={onClick}>{msg}</a>
      : <button onClick={onClick}>{msg}</button>
    }
  </FormattedMessage>
</li>;

export default DropdownContainer;
