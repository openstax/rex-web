import { ManageCookiesLink as RawCookiesLink } from '@openstax/ui-components';
import styled, { css } from 'styled-components/macro';
import { textRegularStyle } from '../../components/Typography';
import {
  contentWrapperMaxWidth,
  toolbarWidth,
  verticalNavbarMaxWidth,
} from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import { remsToEms } from '../../utils';
import Modal from '../Modal';

const desktopMinWidth = '37.6';
const mobileMaxWidth = '60.1';
const mobileMinWidth = '37.5';
const textColor = '#d5d5d5';

const columnLink = css`
  color: ${textColor};

  &:hover,
  &:active,
  &:focus {
    color: inherit;
  }
`;

export const iconStyles = css`
  height: 1em;
`;

const boxedMargin = 1.5;
export const boxed = css`
  max-width: ${contentWrapperMaxWidth + boxedMargin * 2}rem;
  align-items: center;
  display: flex;
  flex-flow: column nowrap;
  margin: 0 auto;
  padding-left: ${boxedMargin}rem;
  padding-right: ${boxedMargin}rem;
  width: 100%;
`;

const contentWrapperAndNavWidthBreakpoint = `(max-width: ${remsToEms(
  contentWrapperMaxWidth + verticalNavbarMaxWidth * 2
)}em)`;

const verticalNavToolbarStyling = css`
  @media (min-width: ${theme.breakpoints.desktopBreak}em) and ${contentWrapperAndNavWidthBreakpoint} {
    padding-left:
      clamp(
        0rem,
        calc(${toolbarWidth}rem - (100vw - ${contentWrapperMaxWidth}rem) / 2),
        ${toolbarWidth}rem
      );
  }
`;

export const FooterWrapper = styled.footer`
  ${textRegularStyle}
  z-index: 0;
  opacity: 1;
  transition: opacity 0.2s;
  ${disablePrint}
  ${props =>
    props.isVerticalNavOpen === false ? verticalNavToolbarStyling : ''}
`;

export const InnerFooter = styled.div`
  color: ${textColor};
  display: grid;
`;

export const FooterTop = styled.div`
  background-color: #424242;

  @media (min-width: ${mobileMaxWidth}em) {
    padding: 7rem 0;
  }

  @media (max-width: ${mobileMinWidth}em) {
    padding: 2rem 0;
  }

  @media (max-width: ${mobileMaxWidth}em) and (min-width: ${desktopMinWidth}em) {
    padding: 4rem 0;
  }
`;

export const TopBoxed = styled.div`
  ${boxed}
  display: grid;
  grid-row-gap: 2rem;
  overflow: visible;

  @media (min-width: ${desktopMinWidth}em) {
    align-items: start;
    grid-column-gap: 4rem;
    grid-template:
      "headline col1 col2 col3" "mission col1 col2 col3" / minmax(auto, 50rem)
      auto auto auto;
  }

  @media (max-width: ${mobileMinWidth}em) {
    grid-template: "headline" "mission" "col1" "col2" "col3";
  }

  @media (min-width: ${mobileMaxWidth}em) {
    grid-column-gap: 8rem;
  }
`;

export const Heading = styled.h2`
  grid-area: headline;
  margin: 0;

  @media (min-width: ${desktopMinWidth}em) {
    font-size: 2.4rem;
    font-weight: bold;
    letter-spacing: -0.096rem;
    line-height: normal;
  }

  @media (max-width: ${mobileMinWidth}em) {
    font-size: 2rem;
    font-weight: bold;
    letter-spacing: -0.08rem;
    line-height: normal;
  }
`;

const DonateLink = css`
  ${columnLink}
  font-weight: bold;
  text-underline-position: under;
`;

export const Mission = styled.div`
  grid-area: mission;

  @media (min-width: ${desktopMinWidth}em) {
    font-size: 1.8rem;
    font-weight: normal;
    letter-spacing: normal;
    line-height: 3rem;
  }

  a {
    ${DonateLink}
  }
`;

export const footerLinkStyle = css`
  ${columnLink}
  text-decoration: none;

  :hover {
    text-decoration: underline;
  }

  @media (max-width: ${mobileMinWidth}em) {
    line-height: 4.5rem;
  }
`;

export const FooterLink = styled.a`
  ${footerLinkStyle}
`;

export const ManageCookiesLink = styled(RawCookiesLink)`
  && {
    ${textRegularStyle}
    ${footerLinkStyle}
    text-align: left;
  }
`;

const flexFooterLinkStyle = css`
  ${footerLinkStyle}
  font-size: inherit;
  cursor: pointer;
  padding: 0;
  border: none;
  background-color: transparent;
`;

export const FooterButton = styled.button`
  ${flexFooterLinkStyle}
`;

export const ManageCookiesFlexLink = styled(RawCookiesLink)`
  ${flexFooterLinkStyle}
`;

export const ContactDialog = styled(Modal)`
  & > div > div {
    width: 75vw;
    height: 75vh;

    & > header {
      margin-bottom: 0;
    }

    & > iframe {
      border: none;
      width: 100%;
      height: 100%;
    }
  }
`;

export const column = css`
  display: grid;
  grid-gap: 0.5rem;
  overflow: visible;
`;

export const Column1 = styled.div`
  ${column}
  grid-area: col1;
`;

export const Column2 = styled.div`
  ${column}
  grid-area: col2;
`;

export const Column3 = styled.div`
  ${column}
  grid-area: col3;
`;

export const ColumnHeading = styled.h3`
  font-size: 1.8rem;
  font-weight: bold;
  letter-spacing: -0.072rem;
  line-height: normal;
  margin: 0;

  @media (max-width: ${mobileMinWidth}em) {
    line-height: 4.5rem;
  }
`;

export const FooterBottom = styled.div`
  font-size: 1.2rem;
  font-weight: normal;
  letter-spacing: normal;
  line-height: normal;
  background-color: #3b3b3b;

  @media (min-width: ${desktopMinWidth}em) {
    padding: 2.5rem 0;
  }

  @media (max-width: ${mobileMinWidth}em) {
    padding: 1.5rem;
  }
`;

export const BottomBoxed = styled.div`
  ${boxed}
  display: grid;
  grid-gap: 1.5rem 4rem;
  overflow: visible;

  @media (min-width: ${desktopMinWidth}em) {
    grid-auto-flow: column;
  }

  @media (max-width: ${mobileMinWidth}em) {
    padding: 0;
  }
`;

export const PortalBottomBoxed = styled.div`
  ${boxed}
  display: grid;
  grid-gap: 1.5rem 4rem;
  overflow: visible;
  align-items: start;

  @media (min-width: ${desktopMinWidth}em) {
    grid-template: "col1 col2 col3" / minmax(auto, 70rem) auto auto;
  }

  @media (max-width: ${mobileMinWidth}em) {
    padding: 0;
    grid-template:
      "col1"
      "col2"
      "col3";
  }
`;

export const Copyrights = styled.div`
  display: grid;
  grid-gap: 1rem;
  overflow: visible;

  [data-html="copyright"] {
    overflow: visible;
  }

  a {
    ${columnLink}
    overflow: visible;
  }

  sup {
    font-size: 66%;
    margin-left: 0.1rem;
    position: relative;
    top: -0.25em;
    vertical-align: top;
  }
`;

export const Social = styled.menu`
  align-items: center;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 1rem;
  justify-content: end;
  list-style: none;
  overflow: visible;
`;

export const LinkListWrapper = styled.menu`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
`;

export const FooterLogo = styled.img`
  height: 4.7rem;
  transform: translateY(0.2rem);
`;
