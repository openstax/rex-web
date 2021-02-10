import React, { SFC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import RiceWhiteLogo from '../../../assets/rice-white-text.png';
import htmlMessage from '../../components/htmlMessage';
import * as Styled from './styled';

const fbUrl = 'https://www.facebook.com/openstax';
const twitterUrl = 'https://twitter.com/openstax';
const instagramUrl = 'https://www.instagram.com/openstax/';
const linkedInUrl = 'https://www.linkedin.com/company/openstax';
const riceUrl = 'http://www.rice.edu';
const copyrightLink = 'https://creativecommons.org/licenses/by/4.0/';
export const supportCenterLink = 'https://openstax.secure.force.com/help';
const newsletterLink = 'http://www2.openstax.org/l/218812/2016-10-04/lvk';

// tslint:disable-next-line:variable-name
const Mission = htmlMessage('i18n:footer:copyright:mission-text', Styled.Mission);
// tslint:disable-next-line:variable-name
const Copyrights = htmlMessage('i18n:footer:copyright:bottom-text', Styled.Copyrights);

// tslint:disable-next-line:variable-name
const ColumnHeadingMessage: React.SFC<{id: string}> = ({id}) => <Styled.ColumnHeading>
  <FormattedMessage id={id}>
    {(msg) => msg}
  </FormattedMessage>
</Styled.ColumnHeading>;

// tslint:disable-next-line:variable-name
const FooterLinkMessage: React.SFC<{id: string, href: string, target?: string, rel?: string }> =
  ({id, href, target, rel }) => <Styled.FooterLink href={href} target={target ? target : '_self'} rel={rel ? rel : ''}>
  <FormattedMessage id={id}>
    {(msg) => msg}
  </FormattedMessage>
</Styled.FooterLink>;

// tslint:disable-next-line:variable-name
const SocialIconMessage: React.SFC<{id: string, href: string, Icon: React.ComponentType}> =
  ({id, href, Icon}) => <Styled.SocialIcon aria-label={useIntl().formatMessage({id})} href={href}
    target='_blank' rel='noopener'>
    <Icon />
  </Styled.SocialIcon>;

// tslint:disable-next-line:variable-name
const Column1 = () => <Styled.Column1>
  <ColumnHeadingMessage id='i18n:footer:column1:help' />
  <FooterLinkMessage href='/contact' id='i18n:footer:column1:contact-us' />
  <FooterLinkMessage href={supportCenterLink} id='i18n:footer:column1:support-center' target='_blank' rel='noopener'/>
  <FooterLinkMessage href='/faq' id='i18n:footer:column1:faqs' />
</Styled.Column1>;

// tslint:disable-next-line:variable-name
const Column2 = () => <Styled.Column2>
  <ColumnHeadingMessage id='i18n:footer:column2:openstax' />
  <FooterLinkMessage href='/press' id='i18n:footer:column2:press' />
  <FooterLinkMessage href={newsletterLink} target='_blank' rel='noopener' id='i18n:footer:column2:newsletter' />
  <FooterLinkMessage href='/careers' id='i18n:footer:column2:careers' />
</Styled.Column2>;

// tslint:disable-next-line:variable-name
const Column3 = () => <Styled.Column3>
  <ColumnHeadingMessage id='i18n:footer:column3:policies' />
  <FooterLinkMessage href='/accessibility-statement' id='i18n:footer:column3:accessibility' />
  <FooterLinkMessage href='/tos' id='i18n:footer:column3:terms' />
  <FooterLinkMessage href='/license' id='i18n:footer:column3:license' />
  <FooterLinkMessage href='/privacy-policy' id='i18n:footer:column3:privacy-policy' />
</Styled.Column3>;

// tslint:disable-next-line:variable-name
const SocialDirectory = () => <Styled.Social role='directory'>
  <SocialIconMessage id='i18n:footer:social:fb:alt' href={fbUrl} Icon={Styled.FBIcon} />
  <SocialIconMessage id='i18n:footer:social:tw:alt' href={twitterUrl} Icon={Styled.TwitterIcon} />
  <SocialIconMessage id='i18n:footer:social:in:alt' href={linkedInUrl} Icon={Styled.LinkedInIcon} />
  <SocialIconMessage id='i18n:footer:social:ig:alt' href={instagramUrl} Icon={Styled.IGIcon} />
  <Styled.BottomLink href={riceUrl} target='_blank' rel='noopener'>
    <Styled.FooterLogo src={RiceWhiteLogo} alt={useIntl().formatMessage({id: 'i18n:footer:social:rice-logo:alt'})} />
  </Styled.BottomLink>
</Styled.Social>;

function getValues() {
  return {
    copyrightLink,
    currentYear: new Date().getFullYear(),
  };
}

// tslint:disable-next-line:variable-name
const Footer: SFC = () => <Styled.FooterWrapper data-analytics-region='footer'>
  <Styled.InnerFooter>
    <Styled.FooterTop>
      <Styled.TopBoxed>
        <Styled.Heading role='heading' aria-level={2}>
          <FormattedMessage id='i18n:footer:heading'>
            {(msg) => msg}
          </FormattedMessage>
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
</Styled.FooterWrapper>;

export default Footer;
