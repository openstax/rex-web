import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import styled from 'styled-components/macro';
import { useAnalyticsEvent } from '../../../helpers/analytics';
import { openKeyboardShortcutsMenu as openKeyboardShortcutsMenuAction } from '../../content/keyboardShortcuts/actions';
import RiceWhiteLogo from '../../../assets/rice-logo-white.png';
import htmlMessage from '../../components/htmlMessage';
import { isVerticalNavOpenConnector } from '../../content/components/utils/sidebar';
import { State } from '../../content/types';
import * as selectNavigation from '../../navigation/selectors';
import * as guards from '../../guards';
import { MessageEvent } from '@openstax/types/lib.dom';
import { useSelector } from 'react-redux';
import { captureOpeningElement } from '../../content/utils/focusManager';
import { useModalFocusManagement } from '../../content/hooks/useModalFocusManagement';
import { ManageCookiesLink as RawCookiesLink } from '@openstax/ui-components';
import theme from '../../theme';
import Modal from '../Modal';
import './Footer.css';

// Constants
const fbUrl = 'https://www.facebook.com/openstax';
const twitterUrl = 'https://twitter.com/openstax';
const instagramUrl = 'https://www.instagram.com/openstax/';
const linkedInUrl = 'https://www.linkedin.com/company/openstax';
const riceUrl = 'http://www.rice.edu';
const copyrightLink = 'https://creativecommons.org/licenses/by/4.0/';
export const supportCenterLink = 'https://help.openstax.org/s/';
const systemStatusLink = 'https://status.openstax.org/';
const newsletterLink = 'http://www2.openstax.org/l/218812/2016-10-04/lvk';
const textColor = '#d5d5d5';

// Icon components
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

const FBIcon = styled(FacebookIconBase)`
  height: 1em;
`;

/**
 * X (Twitter) icon for social media links.
 * SVG path from Font Awesome Free (https://fontawesome.com - MIT License)
 */
function XTwitterBase({ className, ...props }: IconProps) {
  return (
    <svg
      className={className}
      aria-hidden='true'
      focusable='false'
      data-prefix='fab'
      data-icon='x-twitter'
      role='img'
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 512 512'
      height='1em'
      {...props}
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

const TwitterIcon = styled(XTwitterBase)`
  height: 1em;
`;

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

const IGIcon = styled(InstagramIconBase)`
  height: 1em;
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

const LinkedInIcon = styled(LinkedInIconBase)`
  height: 1em;
`;

// Plain div wrappers for htmlMessage
const MissionDiv = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="footer-mission" {...props}>{children}</div>
);

const CopyrightsDiv = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="footer-copyrights" {...props}>{children}</div>
);

const Mission = htmlMessage('i18n:footer:copyright:mission-text', MissionDiv);
const Copyrights = htmlMessage('i18n:footer:copyright:bottom-text', CopyrightsDiv);

const BareMessage: React.FunctionComponent<{ id: string }> = ({ id }) => (
  <FormattedMessage id={id}>{msg => msg}</FormattedMessage>
);

const ColumnHeadingMessage: React.FunctionComponent<{ id: string }> = ({
  id,
}) => (
  <h3 className="footer-column-heading">
    <BareMessage id={id} />
  </h3>
);

const FooterLinkMessage: React.FunctionComponent<{
  id: string;
  href: string;
  target?: string;
  rel?: string;
}> = ({ id, href, target, rel }) => (
  <a
    className="footer-link"
    href={href}
    target={target ? target : '_self'}
    rel={rel ? rel : ''}
  >
    <BareMessage id={id} />
  </a>
);

const SocialIconMessage: React.FunctionComponent<{
  id: string;
  href: string;
  Icon: React.ComponentType;
}> = ({ id, href, Icon }) => (
  <li>
    <a
      className="footer-social-icon"
      style={{
        '--footer-social-icon-bg': theme.color.primary.gray.light,
        '--footer-social-icon-color': '#fff',
      } as React.CSSProperties}
      aria-label={`OpenStax on ${useIntl().formatMessage({ id })}`}
      href={href}
      target='_blank'
      rel="noopener noreferrer"
    >
      <Icon />
    </a>
  </li>
);

function LinkList({ children }: React.PropsWithChildren<{}>) {
  return (
    <menu className="footer-link-list-wrapper">
      {React.Children.toArray(children).map((c, i) => <li key={i}>{c}</li>)}
    </menu>
  );
}

const OpenKeyboardShortcutsLink = () => {
  const dispatch = useDispatch();
  const trackOpenCloseKS = useAnalyticsEvent('openCloseKeyboardShortcuts');

  const openKeyboardShortcutsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    captureOpeningElement('keyboardshortcuts');
    dispatch(openKeyboardShortcutsMenuAction());
    trackOpenCloseKS();
  };

  return (
    <FormattedMessage id='i18n:a11y:keyboard-shortcuts:heading'>
      {(txt) => (
        <button
          className="footer-button"
          style={{
            '--footer-text-color': textColor,
          } as React.CSSProperties}
          type="button"
          onClick={openKeyboardShortcutsMenu}
          data-testid="shortcut-link"
        >
          {txt}
        </button>
      )}
    </FormattedMessage>
  );
};

const Column1 = () => (
  <div className="footer-column footer-column-1">
    <ColumnHeadingMessage id='i18n:footer:column1:help' />
    <LinkList>
      <FooterLinkMessage href='/contact' id='i18n:footer:column1:contact-us' />
      <FooterLinkMessage
        href={supportCenterLink}
        id='i18n:footer:column1:support-center'
        target='_blank'
        rel='noopener'
      />
      <FooterLinkMessage href='/faq' id='i18n:footer:column1:faqs' />
      <FooterLinkMessage
        href={systemStatusLink}
        id='i18n:footer:column1:system-status'
        target='_blank'
        rel='noopener'
      />
      <OpenKeyboardShortcutsLink />
    </LinkList>
  </div>
);

const Column2 = () => (
  <div className="footer-column footer-column-2">
    <ColumnHeadingMessage id='i18n:footer:column2:openstax' />
    <LinkList>
      <FooterLinkMessage href='/press' id='i18n:footer:column2:press' />
      <FooterLinkMessage
        href={newsletterLink}
        target='_blank'
        rel='noopener'
        id='i18n:footer:column2:newsletter'
      />
      <FooterLinkMessage href='/careers' id='i18n:footer:column2:careers' />
    </LinkList>
  </div>
);

const Column3 = () => (
  <div className="footer-column footer-column-3">
    <ColumnHeadingMessage id='i18n:footer:column3:policies' />
    <LinkList>
      <FooterLinkMessage
        href='/accessibility-statement'
        id='i18n:footer:column3:accessibility'
      />
      <FooterLinkMessage href='/tos' id='i18n:footer:column3:terms' />
      <FooterLinkMessage href='/license' id='i18n:footer:column3:license' />
      <FooterLinkMessage
        href='/privacy-policy'
        id='i18n:footer:column3:privacy-policy'
      />
      <RawCookiesLink className="footer-manage-cookies-link" style={{
        '--footer-text-color': textColor,
      } as React.CSSProperties}>
        <BareMessage id='i18n:footer:column3:manage-cookies' />
      </RawCookiesLink>
    </LinkList>
  </div>
);

const SocialDirectory = () => (
  <menu className="footer-social">
    <SocialIconMessage
      id='i18n:footer:social:fb:alt'
      href={fbUrl}
      Icon={FBIcon}
    />
    <SocialIconMessage
      id='i18n:footer:social:tw:alt'
      href={twitterUrl}
      Icon={TwitterIcon}
    />
    <SocialIconMessage
      id='i18n:footer:social:in:alt'
      href={linkedInUrl}
      Icon={LinkedInIcon}
    />
    <SocialIconMessage
      id='i18n:footer:social:ig:alt'
      href={instagramUrl}
      Icon={IGIcon}
    />
    <li>
      <a className="footer-bottom-link" href={riceUrl} target='_blank' rel="noopener noreferrer">
        <img
          className="footer-logo"
          src={RiceWhiteLogo}
          alt={useIntl().formatMessage({
            id: 'i18n:footer:social:rice-logo:alt',
          })}
        />
      </a>
    </li>
  </menu>
);

function getValues() {
  return {
    copyrightLink,
    currentYear: new Date().getFullYear(),
  };
}

const NormalFooter = ({
  isVerticalNavOpen,
}: {
  isVerticalNavOpen: State['tocOpen'];
}) => (
  <footer
    className={classNames('footer-wrapper', {
      'footer-wrapper--vertical-nav-toolbar': isVerticalNavOpen === false,
    })}
    style={{
      '--footer-text-color': textColor,
    } as React.CSSProperties}
    data-analytics-region='footer'
  >
    <div className="footer-inner">
      <div className="footer-top">
        <div className="footer-top-boxed">
          <h2 className="footer-heading">
            <BareMessage id='i18n:footer:heading' />
          </h2>
          <Mission />
          <Column1 />
          <Column2 />
          <Column3 />
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-boxed">
          <Copyrights values={getValues()} />
          <SocialDirectory />
        </div>
      </div>
    </div>
  </footer>
);

const PortalColumn1 = () => (
  <div className="footer-column footer-column-1">
    <Copyrights values={getValues()} />
  </div>
);

export function ContactDialog({
  isOpen,
  close,
  contactFormParams,
  className,
}: {
  isOpen: boolean;
  close: () => void;
  contactFormParams?: { key: string; value: string }[];
  className?: string;
}) {
  const contactFormUrl = React.useMemo(() => {
    const formUrl = '/embedded/contact';

    if (contactFormParams !== undefined) {
      const params = contactFormParams
        .map(({ key, value }) => encodeURIComponent(`${key}=${value}`))
        .map((p) => `body=${p}`)
        .join('&');

      return `${formUrl}?${params}`;
    }

    return formUrl;
  }, [contactFormParams]);
  const { closeButtonRef } = useModalFocusManagement({ modalId: 'contactdialog', isOpen });

  return !isOpen ? null : (
    <Modal
      className={classNames('footer-contact-dialog', className)}
      onModalClose={close}
      heading='i18n:footer:column1:contact-us'
      closeButtonRef={closeButtonRef}
    >
      <iframe id='contact-us' title='contact-us' src={contactFormUrl} />
    </Modal>
  );
}

export function useContactDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = React.useCallback(() => setIsOpen(false), [setIsOpen]);

  React.useEffect(
    () => {
      const win = window;

      const closeOnSubmit = ({ data }: MessageEvent) => {
        if (data === 'CONTACT_FORM_SUBMITTED') {
          close();
        }
      };

      win?.addEventListener('message', closeOnSubmit);
      return () => win?.removeEventListener('message', closeOnSubmit);
    },
    [close]
  );

  return { isOpen, open, close };
}

const PortalColumn2 = ({ portalName }: { portalName: string }) => {
  const { isOpen, open, close } = useContactDialog();
  const contactFormParams = [
    { key: 'source_url', value: window?.location.href },
  ].filter((p): p is { key: string; value: string } => !!p.value);

  return (
    <div className="footer-column footer-column-2">
      <LinkList>
        <button
          className="footer-button"
          style={{
            '--footer-text-color': textColor,
          } as React.CSSProperties}
          onClick={() => {
            captureOpeningElement('contactdialog');
            open();
          }}
        >
          <BareMessage id='i18n:footer:column1:contact-us' />
        </button>
        <FooterLinkMessage href={`/${portalName}/tos`} id='i18n:footer:column3:terms' />
        <FooterLinkMessage href={`/${portalName}/privacy-policy`} id='i18n:footer:column3:privacy-policy' />
      </LinkList>
      <ContactDialog isOpen={isOpen} contactFormParams={contactFormParams} close={close} />
    </div>
  );
};

const PortalColumn3 = ({ portalName }: { portalName: string }) => (
  <div className="footer-column footer-column-3">
    <LinkList>
      <FooterLinkMessage
        href={`/${portalName}/accessibility-statement`}
        id='i18n:footer:column3:accessibility'
      />
      <FooterLinkMessage href={`/${portalName}/license`} id='i18n:footer:column3:license' />
      <RawCookiesLink className="footer-manage-cookies-flex-link" style={{
        '--footer-text-color': textColor,
      } as React.CSSProperties}>
        <BareMessage id='i18n:footer:column3:manage-cookies' />
      </RawCookiesLink>
    </LinkList>
  </div>
);

const PortalFooter = ({
  isVerticalNavOpen,
  portalName,
}: {
  isVerticalNavOpen: State['tocOpen'];
  portalName: string;
}) => {
  return (
    <footer
      className={classNames('footer-wrapper', {
        'footer-wrapper--vertical-nav-toolbar': isVerticalNavOpen === false,
      })}
      style={{
        '--footer-text-color': textColor,
      } as React.CSSProperties}
      data-analytics-region='footer'
      data-testid='portal-footer'
    >
      <div className="footer-inner">
        <div className="footer-bottom">
          <div className="footer-portal-bottom-boxed">
            <PortalColumn1 />
            <PortalColumn2 portalName={portalName} />
            <PortalColumn3 portalName={portalName} />
          </div>
        </div>
      </div>
    </footer>
  );
};

const Footer = ({
  isVerticalNavOpen,
}: {
  isVerticalNavOpen: State['tocOpen'];
}) => {
  const params = useSelector(selectNavigation.params);
  return (
    !guards.isPortaled(params)
      ? <NormalFooter isVerticalNavOpen={isVerticalNavOpen} />
      : <PortalFooter portalName={params.portalName} isVerticalNavOpen={isVerticalNavOpen} />
  );
};

export default isVerticalNavOpenConnector(Footer);
