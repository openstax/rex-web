import React from 'react';
import styled from 'styled-components/macro';
import { toolbarIconColor } from '../../content/components/constants';
import { toolbarIconStyles } from '../../content/components/Toolbar/iconStyles';
import theme from '../../theme';
import Times from '../Times';
import { bodyCopyRegularStyle, h3Style, h4Style } from '../Typography';

export const modalPadding = 3.0;

// tslint:disable-next-line:variable-name
export const Card = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  overflow: hidden;
  width: 40rem;
  ${bodyCopyRegularStyle};
  background-color: white;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.05), 0 0 4rem rgba(0, 0, 0, 0.08);
`;

// tslint:disable-next-line:variable-name
export const Header = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: ${modalPadding * 0.5}rem;
  padding: ${modalPadding * 0.5}rem ${modalPadding}rem;
  background: ${theme.color.neutral.pageBackground};
  border-bottom: solid 0.1rem ${theme.color.neutral.darker};
  justify-content: space-between;
`;

// tslint:disable-next-line:variable-name
export const Heading = styled.h1`
  ${h4Style}
  display: flex;
  align-items: center;
  margin: 0;
  padding: ${modalPadding * 0.5}rem 0;
`;

// tslint:disable-next-line:variable-name
export const BodyHeading = styled.h3`
  ${h3Style}
  font-weight: 400;
  padding: ${modalPadding * 0.5}rem 0;
`;

// tslint:disable-next-line:variable-name
export const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${modalPadding}rem;

  ${Card.Header} + & { /* stylelint-disable */
    margin-top: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const Mask = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.3);
`;

// tslint:disable-next-line:variable-name
export const ModalWrapper = styled.div`
  top: 0;
  z-index: ${theme.zIndex.errorPopup};
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
export const CardWrapper = styled.div`
  z-index: 1;
`;

// tslint:disable-next-line:variable-name
export const CloseModalIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  cursor: pointer;
  margin-right: 0;
  padding-right: 0;
  color: ${toolbarIconColor.lighter};

  :hover {
    color: ${toolbarIconColor.base};
  }
  height: 2rem;
  width: 2rem;
`;

// tslint:disable-next-line:variable-name
export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${modalPadding}rem;
`;
