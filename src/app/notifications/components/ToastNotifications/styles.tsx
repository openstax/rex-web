import React from 'react';
import styled, { css, keyframes } from 'styled-components/macro';
import { PlainButton } from '../../../components/Button';
import Times from '../../../components/Times';
import { disablePrint } from '../../../content/components/utils/disablePrint';
import theme from '../../../theme';
import { inlineDisplayBreak } from '../../theme';
import { Header } from '../Card';
import { fadeOutDuration } from './constants';
import { ToastProps } from './Toast';

const bannerBackground = '#F8E8EB';
const errorBorderColor = '#E297A0';
const closeIconColor = '#EDBFC5';
const errorTextColor = '#C23834';
const hoveredCloseIconColor = errorBorderColor;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const ToastsContainer = styled.div`
  width: 100%;
  position: absolute;
  overflow: visible;
`;

const setTransitionStyles = ({positionProps, isFadingIn}: BannerProps) => css`
  transition: transform 0.6s;
  z-index: ${positionProps.totalToastCount - positionProps.index};
  transform: translateY(${isFadingIn ? 0 : -100}%);
`;

interface BannerProps {
  isFadingIn: boolean;
  isFadingOut: boolean;
  positionProps: ToastProps['positionProps'];
}

// tslint:disable-next-line:variable-name
export const BannerBodyWrapper = styled.div`
  width: 100%;
  margin: 0;
  overflow: visible;
  ${setTransitionStyles};
  ${(props: BannerProps) => props.isFadingOut && css`
    animation: ${fadeOut} ${fadeOutDuration / 1000}s forwards;
  `}

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const BannerBody = styled.div`
  width: 100%;
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  background: ${bannerBackground};
  justify-content: space-between;
  border: 1px solid ${errorBorderColor};

  ${Header} {
    background: inherit;
    color: ${errorTextColor};
    font-weight: normal;
    line-height: 2.6rem;
  }

  @media (max-width: ${inlineDisplayBreak}) {
    align-items: flex-start;
    padding: 1.6rem ${theme.padding.page.mobile}rem;
  }
`;

// tslint:disable-next-line:variable-name
export const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  width: 1.8rem;
  height: 1.8rem;
  cursor: pointer;
`;

// tslint:disable-next-line:variable-name
export const CloseButton = styled(PlainButton)`
  color: ${closeIconColor};

  &:hover {
    color: ${hoveredCloseIconColor};
  }
`;

// tslint:disable-next-line: variable-name
export const ErrorId = styled.span`
  margin-left: 1rem;
  font-size: 1.3rem;
  color: ${errorTextColor};
`;
