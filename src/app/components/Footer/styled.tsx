import { ManageCookiesLink as RawCookiesLink } from '@openstax/ui-components';
import React from 'react';
import styled, { css } from 'styled-components/macro';
import { textRegularSize, textRegularStyle } from '../../components/Typography';
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

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
}

/**
 * Facebook icon for social media links.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components styling
 */
function FacebookIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"
      />
    </svg>
  );
}

export const FBIcon = styled(FacebookIconBase)`
  ${iconStyles}
`;

/**
 * X (Twitter) icon for social media links.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 */
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

export const TwitterIcon = XTwitter;

/**
 * Instagram icon for social media links.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components styling
 */
function InstagramIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 448 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
      />
    </svg>
  );
}

export const IGIcon = styled(InstagramIconBase)`
  ${iconStyles}
`;

/**
 * LinkedIn icon for social media links.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 *
 * Note: Wrapped with styled() to enable styled-components styling
 */
function LinkedInIconBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 448 512"
      aria-hidden="true"
      {...props}
    >
      <path
        fill="currentColor"
        d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
      />
    </svg>
  );
}

export const LinkedInIcon = styled(LinkedInIconBase)`
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

const InnerSocialIcon = styled.a`
  ${textRegularSize}
  background-color: ${theme.color.primary.gray.light};
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

export const FooterLogo = styled.img`
  height: 4.7rem;
  transform: translateY(0.2rem);
`;
