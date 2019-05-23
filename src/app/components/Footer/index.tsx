import React, { SFC } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { assertString } from '../../utils';
import RiceWhiteLogo from './../../../assets/rice-white-text.png';
import * as Styled from './styled';

const fbUrl = 'https://www.facebook.com/openstax';
const twitterUrl = 'https://twitter.com/openstax';
const instagramUrl = 'https://www.instagram.com/openstax/';
const linkedInUrl = 'https://www.linkedin.com/company/openstax';
const riceUrl = 'http://www.rice.edu';
const copyrightLink = 'https://creativecommons.org/licenses/by/4.0/';
const supportCenterLink = 'https://openstax.secure.force.com/help';
const newsletterLink = 'http://www2.openstax.org/l/218812/2016-10-04/lvk';

const renderMission = () => <FormattedHTMLMessage id='i18n:footer:copyright:mission-text'>
  {(html) => <Styled.Mission
    dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:copyright:mission-text must return a string')}}
  ></Styled.Mission>}
</FormattedHTMLMessage>;

const renderColumn1 = () => <Styled.Column1>
  <Styled.ColumnHeading>
    <FormattedMessage id='i18n:footer:column1:help'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.ColumnHeading>
  <Styled.FooterLink href='/contact'>
    <FormattedMessage id='i18n:footer:column1:contact-us'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
  <Styled.FooterLink href={supportCenterLink}>
    <FormattedMessage id='i18n:footer:column1:support-center'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
  <Styled.FooterLink href='/faq'>
    <FormattedMessage id='i18n:footer:column1:faqs'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
</Styled.Column1>;

const renderColumn2 = () => <Styled.Column2>
  <Styled.ColumnHeading>
    <FormattedMessage id='i18n:footer:column2:openstax'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.ColumnHeading>
  <Styled.FooterLink href='/press'>
    <FormattedMessage id='i18n:footer:column2:press'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
  <Styled.FooterLink href={newsletterLink}>
    <FormattedMessage id='i18n:footer:column2:newsletter'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
  <Styled.FooterLink href='/careers'>
    <FormattedMessage id='i18n:footer:column2:careers'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
</Styled.Column2>;

const renderColumn3 = () => <Styled.Column3>
  <Styled.ColumnHeading>
    <FormattedMessage id='i18n:footer:column3:policies'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.ColumnHeading>
  <Styled.FooterLink href='/accessibility-statement'>
    <FormattedMessage id='i18n:footer:column3:accessibility'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
  <Styled.FooterLink href='/tos'>
    <FormattedMessage id='i18n:footer:column3:terms'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
  <Styled.FooterLink href='/license'>
    <FormattedMessage id='i18n:footer:column3:license'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
  <Styled.FooterLink href='/privacy-policy'>
    <FormattedMessage id='i18n:footer:column3:privacy-policy'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.FooterLink>
</Styled.Column3>;

const renderCopyrights = () => <Styled.Copyrights>
  <FormattedHTMLMessage id='i18n:footer:copyright:bottom-text' values={getValues()}>
    {(html) => <Styled.CopyrightDiv data-html='copyright'
      dangerouslySetInnerHTML={{__html: assertString(html, 'i18n:copyright:top-text must return a string')}}
    ></Styled.CopyrightDiv>}
  </FormattedHTMLMessage>
</Styled.Copyrights>;

const renderSocialDirectory = () => <Styled.Social role='directory'>
  <FormattedMessage id='i18n:footer:social:fb:alt'>
    {(msg: Element | string) => <Styled.SocialIcon alt={msg} href={fbUrl}>
      <Styled.FBIcon />
    </Styled.SocialIcon>}
  </FormattedMessage>
  <FormattedMessage id='i18n:footer:social:tw:alt'>
    {(msg: Element | string) => <Styled.SocialIcon alt={msg} href={twitterUrl}>
      <Styled.TwitterIcon />
    </Styled.SocialIcon>}
  </FormattedMessage>
  <FormattedMessage id='i18n:footer:social:in:alt'>
    {(msg: Element | string) => <Styled.SocialIcon alt={msg} href={linkedInUrl}>
      <Styled.LinkedInIcon />
    </Styled.SocialIcon>}
  </FormattedMessage>
  <FormattedMessage id='i18n:footer:social:ig:alt'>
    {(msg: Element | string) => <Styled.SocialIcon alt={msg} href={instagramUrl}>
      <Styled.IGIcon />
    </Styled.SocialIcon>}
  </FormattedMessage>
  <FormattedMessage id='i18n:footer:social:rice-logo:alt'>
    {(msg: Element | string) => <Styled.BottomLink href={riceUrl}>
      <Styled.FooterLogo src={RiceWhiteLogo} alt={msg} />
    </Styled.BottomLink>}
  </FormattedMessage>
</Styled.Social>;

function getValues() {
  return {
    copyrightLink,
    currentYear: new Date().getFullYear(),
  };
}

// tslint:disable-next-line:variable-name
const Footer: SFC = () => <Styled.FooterWrapper>
  <Styled.InnerFooter>
    <Styled.FooterTop>
      <Styled.TopBoxed>
        <Styled.Heading role='heading' aria-level={2}>
          <FormattedMessage id='i18n:footer:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </Styled.Heading>
        {renderMission()}
        {renderColumn1()}
        {renderColumn2()}
        {renderColumn3()}
      </Styled.TopBoxed>
    </Styled.FooterTop>
    <Styled.FooterBottom>
      <Styled.BottomBoxed>
        {renderCopyrights()}
        {renderSocialDirectory()}
      </Styled.BottomBoxed>
    </Styled.FooterBottom>
  </Styled.InnerFooter>
</Styled.FooterWrapper>;

export default Footer;
