import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import { FacebookF } from 'styled-icons/fa-brands/FacebookF';
import { Instagram } from 'styled-icons/fa-brands/Instagram';
import { LinkedinIn } from 'styled-icons/fa-brands/LinkedinIn';
import { Twitter } from 'styled-icons/fa-brands/Twitter';
import { textRegularSize, textRegularStyle } from '../../components/Typography';
const fbUrl = 'https://www.facebook.com/openstax';
const twitterUrl = 'https://twitter.com/openstax';
const instagramUrl = 'https://www.instagram.com/openstax/';
const linkedInUrl = 'https://www.linkedin.com/company/openstax';
const riceUrl = 'http://www.rice.edu';
const copyrightLink = 'https://creativecommons.org/licenses/by/4.0/';
const supportCenterLink = 'https://openstax.secure.force.com/help';
const newsletterLink = 'http://www2.openstax.org/l/218812/2016-10-04/lvk';

const desktopMinWidth = '37.6';
const mobileMaxWidth = '60.1';
const mobileMinWidth = '37.5';

const columnLink = css`
    color: inherit;
`;

const iconStyles = css`
    height: 2rem;
`;

// tslint:disable-next-line:variable-name
const FBIcon = styled(FacebookF)`
    ${iconStyles}
`;

// tslint:disable-next-line:variable-name
const TwitterIcon = styled(Twitter)`
    ${iconStyles}
`;

// tslint:disable-next-line:variable-name
const IGIcon = styled(Instagram)`
    ${iconStyles}
`;

// tslint:disable-next-line:variable-name
const LinkedInIcon = styled(LinkedinIn)`
    ${iconStyles}
`;

const boxed = css`
    max-width: 120rem;
    align-items: center;
    display: flex;
    flex-flow: column nowrap;
    margin: 0 auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    width: 100%;
`;

// tslint:disable-next-line:variable-name
const FooterWrapper = styled.footer`
    ${textRegularStyle}
    z-index: 0;
    opacity: 1;
    transition: opacity 0.2s;
`;

// tslint:disable-next-line:variable-name
const InnerFooter = styled.footer`
    color: #d5d5d5;
    display: grid;
`;

// tslint:disable-next-line:variable-name
const FooterTop = styled.div`
    background-color: #424242;

    @media (min-width: ${mobileMaxWidth}em) {
        padding: 7rem 0;
    }

    @media (max-width: ${mobileMinWidth}em) {
        padding: 2rem 0;
    }

`;

// tslint:disable-next-line:variable-name
const TopBoxed = styled.div`
    ${boxed}
    display: grid;
    grid-row-gap: 2rem;

    @media (min-width: ${desktopMinWidth}em) {
        align-items: start;
        grid-column-gap: 4rem;
        grid-template: "headline col1 col2 col3" "mission col1 col2 col3"/minmax(auto, 50rem) auto auto auto;
    }

    @media (max-width: ${mobileMinWidth}em) {
        grid-template: 'headline' 'mission' 'col1' 'col2' 'col3';
    }

    @media (min-width: ${mobileMaxWidth}em) {
        grid-column-gap: 8rem;
    }

`;

// tslint:disable-next-line:variable-name
const Heading = styled.div`
    grid-area: headline;

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
const Mission = styled.div`
    grid-area: mission;
    @media (min-width: ${desktopMinWidth}em) {
        font-size: 1.8rem;
        font-weight: normal;
        letter-spacing: normal;
        line-height: normal;
        line-height: 3rem;
    }
`;

// tslint:disable-next-line:variable-name
const DonateLink = styled.a`
    ${columnLink}
    font-weight: bold;
    text-underline-position: under;
`;

// tslint:disable-next-line:variable-name
const FooterLink = styled.a`
    ${columnLink}
    text-decoration: none;

    :hover {
        text-decoration: underline;
    }
`;

// tslint:disable-next-line:variable-name
const BottomLink = styled.a`
    ${columnLink}
`;

const column = css`
    display: grid;
    grid-gap: 0.5rem;
`;

// tslint:disable-next-line:variable-name
const Column1 = styled.div`
    ${column}
    grid-area: col1;
`;

// tslint:disable-next-line:variable-name
const Column2 = styled.div`
    ${column}
    grid-area: col2;
`;

// tslint:disable-next-line:variable-name
const Column3 = styled.div`
    ${column}
    grid-area: col3;
`;

// tslint:disable-next-line:variable-name
const ColumnHeading = styled.div`
    font-size: 1.8rem;
    font-weight: bold;
    letter-spacing: -0.072rem;
    line-height: normal;
`;

// tslint:disable-next-line:variable-name
const FooterBottom = styled.div`
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
const BottomBoxed = styled.div`
    ${boxed}
    display: grid;
    grid-column-gap: 4rem;
    grid-row-gap: 1.5rem;

    @media (min-width: ${desktopMinWidth}em) {
        grid-auto-flow: column;
    }

    @media (max-width: ${mobileMinWidth}em) {
        padding: 0;
    }
`;

// tslint:disable-next-line:variable-name
const Copyrights = styled.div`
    display: grid;
    grid-gap: 1rem;
`;

// tslint:disable-next-line:variable-name
const CopyrightDiv = styled.div`
`;

// tslint:disable-next-line:variable-name
const Social = styled.div`
    align-items: center;
    display: grid;
    grid-auto-flow: column;
    grid-gap: 1rem;
    justify-content: left;
`;

// tslint:disable-next-line:variable-name
const SocialIcon = styled.a`
    ${columnLink}
    ${textRegularSize}
    background-color: #959595;
    align-content: center;
    border-radius: 50%;
    display: grid;
    height: 3rem;
    justify-content: center;
    overflow: hidden;
    width: 3rem;
`;

// tslint:disable-next-line:variable-name
const FooterLogo = styled.img`
    height: 4rem;
    -webkit-transform: translateY(0.2rem);
    transform: translateY(0.2rem);
`;

// tslint:disable-next-line:variable-name
export class Footer extends Component<any> {
    public render() {
        return <FooterWrapper>
            <InnerFooter>
                <FooterTop>
                    <TopBoxed>
                        <Heading role='heading'>
                            <FormattedMessage id='i18n:footer:heading'>
                                {(msg: Element | string) => msg}
                            </FormattedMessage>
                        </Heading>
                        <Mission>
                            <FormattedMessage id='i18n:footer:mission'>
                                {(msg: Element | string) => msg}
                            </FormattedMessage>
                            <DonateLink href='/give' target='_blank'>
                                <FormattedMessage id='i18n:footer:donate-link:text'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </DonateLink>
                            <FormattedMessage id='i18n:footer:donate-link:today'>
                                {(msg: Element | string) => msg}
                            </FormattedMessage>.
                        </Mission>
                        <Column1>
                            <ColumnHeading>
                                <FormattedMessage id='i18n:footer:column1:help'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </ColumnHeading>
                            <FooterLink href='/contact'>
                                <FormattedMessage id='i18n:footer:column1:contact-us'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                            <FooterLink href={supportCenterLink}>
                                <FormattedMessage id='i18n:footer:column1:support-center'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                            <FooterLink href='/faq'>
                                <FormattedMessage id='i18n:footer:column1:faqs'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                        </Column1>
                        <Column2>
                            <ColumnHeading>
                                <FormattedMessage id='i18n:footer:column2:openstax'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </ColumnHeading>
                            <FooterLink href='/press'>
                                <FormattedMessage id='i18n:footer:column2:press'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                            <FooterLink href={newsletterLink}>
                                <FormattedMessage id='i18n:footer:column2:newsletter'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                            <FooterLink href='/careers'>
                                <FormattedMessage id='i18n:footer:column2:careers'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                        </Column2>
                        <Column3>
                            <ColumnHeading>
                                <FormattedMessage id='i18n:footer:column3:policies'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </ColumnHeading>
                            <FooterLink href='/accessibility-statement'>
                                <FormattedMessage id='i18n:footer:column3:accessibility'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                            <FooterLink href='/tos'>
                                <FormattedMessage id='i18n:footer:column3:terms'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                            <FooterLink href='/license'>
                                <FormattedMessage id='i18n:footer:column3:license'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                            <FooterLink href='/privacy-policy'>
                                <FormattedMessage id='i18n:footer:column3:privacy-policy'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </FooterLink>
                        </Column3>
                    </TopBoxed>
                </FooterTop>
                <FooterBottom>
                    <BottomBoxed>
                        <Copyrights>
                            <CopyrightDiv data-html='copyright'>
                                <FormattedMessage id='i18n:footer:copyright:top-text'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                                <BottomLink href={copyrightLink}>
                                    <FormattedMessage id='i18n:footer:copyright:top-text:link'>
                                        {(msg: Element | string) => msg}
                                    </FormattedMessage>
                                </BottomLink>.
                            </CopyrightDiv>

                            <CopyrightDiv data-html='apStatement'>
                                <FormattedMessage id='i18n:footer:copyright:bottom-text'>
                                    {(msg: Element | string) => msg}
                                </FormattedMessage>
                            </CopyrightDiv>

                        </Copyrights>
                        <Social role='directory'>
                            <SocialIcon title='facebook' href={fbUrl}>
                                <FBIcon/>
                            </SocialIcon>
                            <SocialIcon title='twitter' href={twitterUrl}>
                                <TwitterIcon/>
                            </SocialIcon>
                            <SocialIcon title='linkedin' href={linkedInUrl}>
                                <LinkedInIcon/>
                            </SocialIcon>
                            <SocialIcon title='instagram' href={instagramUrl}>
                                <IGIcon/>
                            </SocialIcon>
                            <BottomLink href={riceUrl}>
                                <FooterLogo src='/images/rice-white-text.png' alt='Rice University logo'/>
                            </BottomLink>
                        </Social>
                    </BottomBoxed>
                </FooterBottom>
            </InnerFooter>
        </FooterWrapper>;
    }
  }
