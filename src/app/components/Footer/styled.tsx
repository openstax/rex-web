import { ManageCookiesLink as RawCookiesLink } from '@openstax/ui-components';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import { FacebookF } from 'styled-icons/fa-brands/FacebookF';
import { Instagram } from 'styled-icons/fa-brands/Instagram';
import { LinkedinIn } from 'styled-icons/fa-brands/LinkedinIn';
import { textRegularSize, textRegularStyle } from '../../components/Typography';
import {
  contentWrapperMaxWidth,
  toolbarWidth,
  verticalNavbarMaxWidth
} from '../../content/components/constants';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import { remsToEms } from '../../utils';
import Modal from '../Modal';

const desktopMinWidth = '37.6';
const mobileMaxWidth = '60.1';
const mobileMinWidth = '37.5';
const textColor = '#d5d5d5';

export const columnLink = css`
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

// tslint:disable-next-line:variable-name
export const FBIcon = styled(FacebookF)`
  ${iconStyles}
`;

// This is the SVG output by FontAwesome on osweb. Temporary filler until
// styled-icons updates their icon set.
// The use of styled(XTwitter) didn't do anything; I had to
// set the height here.
function XTwitter() {
  return (
    <svg
      aria-hidden='true'
      focusable='false'
      data-prefix='fab'
      data-icon='x-twitter'
      role='img'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 512 512'
      className='svg-inline--fa fa-x-twitter'
      height='1em'
    >
      <path
        fill='currentColor'
        d={
          'M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5' +
          ' 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z'
        }
      ></path>
    </svg>
  );
}

// tslint:disable-next-line:variable-name
export const TwitterIcon = XTwitter;

// tslint:disable-next-line:variable-name
export const IGIcon = styled(Instagram)`
  ${iconStyles}
`;

// tslint:disable-next-line:variable-name
export const LinkedInIcon = styled(LinkedinIn)`
  ${iconStyles}
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

// tslint:disable-next-line:variable-name
export const FooterWrapper = styled.footer`
  ${textRegularStyle}
  z-index: 0;
  opacity: 1;
  transition: opacity 0.2s;
  ${disablePrint}
  ${props =>
    props.isVerticalNavOpen === false ? verticalNavToolbarStyling : ''}
`;

// tslint:disable-next-line:variable-name
export const InnerFooter = styled.div`
  color: ${textColor};
  display: grid;
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
const DonateLink = css`
  ${columnLink}
  font-weight: bold;
  text-underline-position: under;
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
export const FooterLink = styled.a`
  ${footerLinkStyle}
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
export const FooterButton = styled.button`
  ${flexFooterLinkStyle}
`;

// tslint:disable-next-line:variable-name
export const ManageCookiesFlexLink = styled(RawCookiesLink)`
  ${flexFooterLinkStyle}
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
const InnerBottomLink = styled.a`
  ${columnLink}
  display: inline-grid;
  grid-auto-flow: column;
  grid-column-gap: 0.7rem;
  overflow: hidden;
`;

export function BottomLink(props: React.AnchorHTMLAttributes<unknown>) {
  return (
    <li>
      <InnerBottomLink {...props} />
    </li>
  );
}

export const column = css`
  display: grid;
  grid-gap: 0.5rem;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const Column1 = styled.div`
  ${column}
  grid-area: col1;
`;

// tslint:disable-next-line:variable-name
export const Column2 = styled.div`
  ${column}
  grid-area: col2;
`;

// tslint:disable-next-line:variable-name
export const Column3 = styled.div`
  ${column}
  grid-area: col3;
`;

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
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

// tslint:disable-next-line:variable-name
export const Social = styled.menu`
  align-items: center;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 1rem;
  justify-content: end;
  list-style: none;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const LinkListWrapper = styled.menu`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
`;

// tslint:disable-next-line:variable-name
const InnerSocialIcon = styled.a`
  ${columnLink}
  ${textRegularSize}
  background-color: #878787;
  color: #fff;
  align-content: center;
  border-radius: 50%;
  display: grid;
  height: 3rem;
  justify-content: center;
  overflow: hidden;
  width: 3rem;
`;

export function SocialIcon(props: React.AnchorHTMLAttributes<unknown>) {
  return (
    <li>
      <InnerSocialIcon {...props} />
    </li>
  );
}

// tslint:disable-next-line:variable-name
export const FooterLogo = styled.img`
  height: 4rem;
  transform: translateY(0.2rem);
`;
