import React, { SFC } from 'react';
import { FormattedMessage } from 'react-intl';
import * as Styled from './styled';

const fbUrl = 'https://www.facebook.com/openstax';
const twitterUrl = 'https://twitter.com/openstax';
const instagramUrl = 'https://www.instagram.com/openstax/';
const linkedInUrl = 'https://www.linkedin.com/company/openstax';
const riceUrl = 'http://www.rice.edu';
const copyrightLink = 'https://creativecommons.org/licenses/by/4.0/';
const supportCenterLink = 'https://openstax.secure.force.com/help';
const newsletterLink = 'http://www2.openstax.org/l/218812/2016-10-04/lvk';

const renderMission = () => <Styled.Mission>
  <FormattedMessage id='i18n:footer:mission'>
    {(msg: Element | string) => msg}
  </FormattedMessage>
  <Styled.DonateLink href='/give' target='_blank'>
    <FormattedMessage id='i18n:footer:donate-link:text'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.DonateLink>
  <FormattedMessage id='i18n:footer:donate-link:today'>
    {(msg: Element | string) => msg}
  </FormattedMessage>.
</Styled.Mission>;

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
  <Styled.CopyrightDiv data-html='copyright'>
    <FormattedMessage id='i18n:footer:copyright:top-text' values={getValues()}>
      {(msg: Element | string) => msg}
    </FormattedMessage>
    <Styled.BottomLink href={copyrightLink}>
      <FormattedMessage id='i18n:footer:copyright:top-text:link'>
        {(msg: Element | string) => msg}
      </FormattedMessage>
    </Styled.BottomLink>.
  </Styled.CopyrightDiv>
  <Styled.CopyrightDiv data-html='apStatement'>
    <FormattedMessage id='i18n:footer:copyright:bottom-text'>
      {(msg: Element | string) => msg}
    </FormattedMessage>
  </Styled.CopyrightDiv>
</Styled.Copyrights>;

const renderSocialDirectory = () => <Styled.Social role='directory'>
  <Styled.SocialIcon title='facebook' href={fbUrl}>
    <Styled.FBIcon />
  </Styled.SocialIcon>
  <Styled.SocialIcon title='twitter' href={twitterUrl}>
    <Styled.TwitterIcon />
  </Styled.SocialIcon>
  <Styled.SocialIcon title='linkedin' href={linkedInUrl}>
    <Styled.LinkedInIcon />
  </Styled.SocialIcon>
  <Styled.SocialIcon title='instagram' href={instagramUrl}>
    <Styled.IGIcon />
  </Styled.SocialIcon>
  <Styled.BottomLink href={riceUrl}>
    <Styled.FooterLogo src='/images/rice-white-text.png' alt='Rice University logo' />
  </Styled.BottomLink>
</Styled.Social>;

function getValues() {
  return {
    currentYear: new Date().getFullYear(),
  };
}

// tslint:disable-next-line:variable-name
const Footer: SFC = () => <Styled.FooterWrapper>
  <Styled.InnerFooter>
    <Styled.FooterTop>
      <Styled.TopBoxed>
        <Styled.Heading role='heading'>
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
