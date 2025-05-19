import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import RiceWhiteLogo from '../../../assets/rice-white-text.png';
import htmlMessage from '../../components/htmlMessage';
import { isVerticalNavOpenConnector } from '../../content/components/utils/sidebar';
import { State } from '../../content/types';
import * as selectNavigation from '../../navigation/selectors';
import * as Styled from './styled';
import { useSelector } from 'react-redux';
import { MessageEvent } from '@openstax/types/lib.dom';

const fbUrl = 'https://www.facebook.com/openstax';
const twitterUrl = 'https://twitter.com/openstax';
const instagramUrl = 'https://www.instagram.com/openstax/';
const linkedInUrl = 'https://www.linkedin.com/company/openstax';
const riceUrl = 'http://www.rice.edu';
const copyrightLink = 'https://creativecommons.org/licenses/by/4.0/';
export const supportCenterLink = 'https://help.openstax.org/s/';
const newsletterLink = 'http://www2.openstax.org/l/218812/2016-10-04/lvk';

// tslint:disable-next-line:variable-name
const Mission = htmlMessage(
  'i18n:footer:copyright:mission-text',
  Styled.Mission
);
// tslint:disable-next-line:variable-name
const Copyrights = htmlMessage(
  'i18n:footer:copyright:bottom-text',
  Styled.Copyrights
);

// tslint:disable-next-line:variable-name
const BareMessage: React.FunctionComponent<{ id: string }> = ({ id }) => (
  <FormattedMessage id={id}>{msg => msg}</FormattedMessage>
);

// tslint:disable-next-line:variable-name
const ColumnHeadingMessage: React.FunctionComponent<{ id: string }> = ({
  id,
}) => (
  <Styled.ColumnHeading>
    <BareMessage id={id} />
  </Styled.ColumnHeading>
);

// tslint:disable-next-line:variable-name
const FooterLinkMessage: React.FunctionComponent<{
  id: string;
  href: string;
  target?: string;
  rel?: string;
}> = ({ id, href, target, rel }) => (
  <Styled.FooterLink
    href={href}
    target={target ? target : '_self'}
    rel={rel ? rel : ''}
  >
    <BareMessage id={id} />
  </Styled.FooterLink>
);

// tslint:disable-next-line:variable-name
const SocialIconMessage: React.FunctionComponent<{
  id: string;
  href: string;
  Icon: React.ComponentType;
}> = ({ id, href, Icon }) => (
  <Styled.SocialIcon
    aria-label={useIntl().formatMessage({ id })}
    href={href}
    target='_blank'
    rel='noopener'
  >
    <Icon />
  </Styled.SocialIcon>
);

function LinkList({children}: React.PropsWithChildren<{}>) {
  return (
    <Styled.LinkListWrapper>
      {React.Children.toArray(children).map((c, i) => <li key={i}>{c}</li>)}
    </Styled.LinkListWrapper>
  );
}

// tslint:disable-next-line:variable-name
const Column1 = () => (
  <Styled.Column1>
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
    </LinkList>
  </Styled.Column1>
);

// tslint:disable-next-line:variable-name
const Column2 = () => (
  <Styled.Column2>
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
  </Styled.Column2>
);

// tslint:disable-next-line:variable-name
const Column3 = () => (
  <Styled.Column3>
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
      <Styled.ManageCookiesLink>
        <BareMessage id='i18n:footer:column3:manage-cookies' />
      </Styled.ManageCookiesLink>
    </LinkList>
  </Styled.Column3>
);

// tslint:disable-next-line:variable-name
const SocialDirectory = () => (
  <Styled.Social>
    <SocialIconMessage
      id='i18n:footer:social:fb:alt'
      href={fbUrl}
      Icon={Styled.FBIcon}
    />
    <SocialIconMessage
      id='i18n:footer:social:tw:alt'
      href={twitterUrl}
      Icon={Styled.TwitterIcon}
    />
    <SocialIconMessage
      id='i18n:footer:social:in:alt'
      href={linkedInUrl}
      Icon={Styled.LinkedInIcon}
    />
    <SocialIconMessage
      id='i18n:footer:social:ig:alt'
      href={instagramUrl}
      Icon={Styled.IGIcon}
    />
    <Styled.BottomLink href={riceUrl} target='_blank' rel='noopener'>
      <Styled.FooterLogo
        src={RiceWhiteLogo}
        alt={useIntl().formatMessage({
          id: 'i18n:footer:social:rice-logo:alt',
        })}
      />
    </Styled.BottomLink>
  </Styled.Social>
);

function getValues() {
  return {
    copyrightLink,
    currentYear: new Date().getFullYear(),
  };
}

// tslint:disable-next-line:variable-name
const NormalFooter = ({
  isVerticalNavOpen,
}: {
  isVerticalNavOpen: State['tocOpen'];
}) => (
  <Styled.FooterWrapper
    data-analytics-region='footer'
    isVerticalNavOpen={isVerticalNavOpen}
  >
    <Styled.InnerFooter>
      <Styled.FooterTop>
        <Styled.TopBoxed>
          <Styled.Heading>
            <BareMessage id='i18n:footer:heading' />
          </Styled.Heading>
          <Mission />
          <Column1 />
          <Column2 />
          <Column3 />
        </Styled.TopBoxed>
      </Styled.FooterTop>
      <Styled.FooterBottom>
        <Styled.BottomBoxed>
          <Copyrights values={getValues()} />
          <SocialDirectory />
        </Styled.BottomBoxed>
      </Styled.FooterBottom>
    </Styled.InnerFooter>
  </Styled.FooterWrapper>
);

// tslint:disable-next-line:variable-name
const PortalColumn1 = () => (
  <Styled.Column1>
    <Copyrights values={getValues()} />
  </Styled.Column1>
);

// tslint:disable-next-line:variable-name
export function ContactDialog({
  isOpen,
  close,
  contactFormParams,
  className,
}: {
  isOpen: boolean;
  close: () => void;
  contactFormParams?: {key: string; value: string}[];
  className?: string;
}) {
  const contactFormUrl = React.useMemo(() => {
    const formUrl = '/embedded/contact';

    if (contactFormParams !== undefined) {
      const params = contactFormParams
        .map(({key, value}) => encodeURIComponent(`${key}=${value}`))
        .map((p) => `body=${p}`)
        .join('&');

      return `${formUrl}?${params}`;
    }

    return formUrl;
  }, [contactFormParams]);
  return !isOpen ? null : (
    <Styled.ContactDialog className={className} onModalClose={close} heading='i18n:footer:column1:contact-us'>
      <iframe id='contact-us' title='contact-us' src={contactFormUrl} />
    </Styled.ContactDialog>
  );
}

export function useContactDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const open = React.useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = React.useCallback(() => setIsOpen(false), [setIsOpen]);

  React.useEffect(
    () => {
      if (typeof window === 'undefined' || !window.parent || window.parent === window) {
        return;
      }

      const win = window;

      const closeOnSubmit = ({data}: MessageEvent) => {
        if (data === 'CONTACT_FORM_SUBMITTED') {
          close();
        }
      };

      win.addEventListener('message', closeOnSubmit);
      return () => win.removeEventListener('message', closeOnSubmit);
    },
    [close]
  );

  const WrappedDialog = React.useCallback((
    props: Omit<Parameters<typeof ContactDialog>[0], 'isOpen' | 'close'>
  ) => (
    <ContactDialog {...props} close={close} isOpen={isOpen} />
  ), [close, isOpen]);

  return {ContactDialog: WrappedDialog, open};
}

// tslint:disable-next-line:variable-name
const PortalColumn2 = () => {
  const { ContactDialog, open } = useContactDialog();
  const contactFormParams = [
    {key: 'source_url', value: window?.location.href},
  ].filter((p): p is { key: string; value: string } => !!p.value);

  return (
    <Styled.Column2>
      <LinkList>
        <Styled.FooterButton onClick={open}>
          <BareMessage id='i18n:footer:column1:contact-us' />
        </Styled.FooterButton>
        <FooterLinkMessage href='/tos' id='i18n:footer:column3:terms' />
        <FooterLinkMessage href='/privacy-policy' id='i18n:footer:column3:privacy-policy' />
      </LinkList>
      <ContactDialog contactFormParams={contactFormParams} />
    </Styled.Column2>
  );
};

// tslint:disable-next-line:variable-name
const PortalColumn3 = () => (
  <Styled.Column3>
    <LinkList>
      <FooterLinkMessage
        href='/accessibility-statement'
        id='i18n:footer:column3:accessibility'
      />
      <Styled.ManageCookiesLink>
        <BareMessage id='i18n:footer:column3:manage-cookies' />
      </Styled.ManageCookiesLink>
    </LinkList>
  </Styled.Column3>
);

// tslint:disable-next-line:variable-name
const PortalFooter = ({
  isVerticalNavOpen,
}: {
  isVerticalNavOpen: State['tocOpen'];
}) => {
  return (
    <Styled.FooterWrapper
      data-analytics-region='footer'
      data-testid='portal-footer'
      isVerticalNavOpen={isVerticalNavOpen}
    >
      <Styled.InnerFooter>
        <Styled.FooterBottom>
          <Styled.PortalBottomBoxed>
            <PortalColumn1 />
            <PortalColumn2 />
            <PortalColumn3 />
          </Styled.PortalBottomBoxed>
        </Styled.FooterBottom>
      </Styled.InnerFooter>
    </Styled.FooterWrapper>
  );
};

// tslint:disable-next-line:variable-name
const Footer = ({
  isVerticalNavOpen,
}: {
  isVerticalNavOpen: State['tocOpen'];
}) => {
  const portalName = useSelector(selectNavigation.portalName);
  return (
    portalName === undefined
      ? <NormalFooter isVerticalNavOpen={isVerticalNavOpen} />
      : <PortalFooter isVerticalNavOpen={isVerticalNavOpen} />
  );
};

export default isVerticalNavOpenConnector(Footer);
