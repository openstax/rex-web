import React, { Component } from 'react';
import styled, { css } from 'styled-components/macro';
import { FacebookF } from 'styled-icons/fa-brands/FacebookF';
import { Instagram } from 'styled-icons/fa-brands/Instagram';
import { LinkedinIn } from 'styled-icons/fa-brands/LinkedinIn';
import { Twitter } from 'styled-icons/fa-brands/Twitter';
import { textRegularStyle } from '../../components/Typography';
const fbUrl = 'https://www.facebook.com/openstax';
const twitterUrl = 'https://twitter.com/openstax';
const instagramUrl = 'https://www.instagram.com/openstax/';
const linkedInUrl = 'https://www.linkedin.com/company/openstax';

// tslint:disable-next-line:variable-name
const FooterWrapper = styled.footer`
    ${textRegularStyle}
    z-index: 0;
    opacity: 1;
    transition: opacity 0.2s;
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

// tslint:disable-next-line:variable-name
const InnerFooter = styled.footer`
    color: #d5d5d5;
    display: grid;
`;

// tslint:disable-next-line:variable-name
const FooterTop = styled.div`
    background-color: #424242;

    @media (min-width: 60.1em) {
        padding: 7rem 0;
    }

    @media (max-width: 37.5em) {
        padding: 2rem 0;
    }

`;

// tslint:disable-next-line:variable-name
const TopBoxed = styled.div`
    ${boxed}
    display: grid;
    grid-row-gap: 2rem;

    @media (min-width: 37.6em) {
        align-items: start;
        grid-column-gap: 4rem;
        grid-template: "headline col1 col2 col3" "mission col1 col2 col3"/minmax(auto, 50rem) auto auto auto;
    }

    @media (max-width: 37.5em) {
        grid-template: 'headline' 'mission' 'col1' 'col2' 'col3';
    }

    @media (min-width: 60.1em) {
        grid-column-gap: 8rem;
    }

`;

// tslint:disable-next-line:variable-name
const Heading = styled.div`
    grid-area: headline;

    @media (min-width: 37.6em) {
        font-size: 2.4rem;
        font-weight: bold;
        letter-spacing: -0.096rem;
        line-height: normal;
    }

    @media (max-width: 37.5em) {
        font-size: 2rem;
        font-weight: bold;
        letter-spacing: -0.08rem;
        line-height: normal;
    }
`;

// tslint:disable-next-line:variable-name
const Mission = styled.div`
    grid-area: mission;
    @media (min-width: 37.6em) {
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
`;

// tslint:disable-next-line:variable-name
const FooterLink = styled.a`
    ${columnLink}
    text-decoration: none;
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

    @media (min-width: 37.6em) {
        padding: 2.5rem 0;
    }

    @media (max-width: 37.5em) {
        padding: 1.5rem;
    }
`;

// tslint:disable-next-line:variable-name
const BottomBoxed = styled.div`
    ${boxed}
    display: grid;
    grid-column-gap: 4rem;
    grid-row-gap: 1.5rem;

    @media (min-width: 37.6em) {
        grid-auto-flow: column;
    }

    @media (max-width: 37.5em) {
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
    background-color: #959595;
    align-content: center;
    border-radius: 50%;
    display: grid;
    font-size: 1.6rem;
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
                        <Heading role='heading'>OpenStax at Rice University is a 501(c)(3) nonprofit charity</Heading>
                        <Mission>It's our mission to give every student the tools they need to
                            be successful in the classroom. Help our cause by
                            <DonateLink href='/give' target='_blank'> donating</DonateLink> today.
                        </Mission>
                        <Column1>
                            <ColumnHeading>Help</ColumnHeading>
                            <FooterLink href='/contact'>Contact Us</FooterLink>
                            <FooterLink href='https://openstax.secure.force.com/help'>Support Center</FooterLink>
                            <FooterLink href='/faq'>FAQ</FooterLink>
                        </Column1>
                        <Column2>
                            <ColumnHeading>OpenStax</ColumnHeading>
                            <FooterLink href='/press'>Press</FooterLink>
                            <FooterLink href='http://www2.openstax.org/l/218812/2016-10-04/lvk'>Newsletter</FooterLink>
                            <FooterLink href='/careers'>Careers</FooterLink>
                        </Column2>
                        <Column3>
                            <ColumnHeading>Policies</ColumnHeading>
                            <FooterLink href='/accessibility-statement'>Accessibility Statement</FooterLink>
                            <FooterLink href='/tos'>Terms of Use</FooterLink>
                            <FooterLink href='/license'>Licensing</FooterLink>
                            <FooterLink href='/privacy-policy'>Privacy Policy</FooterLink>
                        </Column3>
                    </TopBoxed>
                </FooterTop>
                <FooterBottom>
                    <BottomBoxed>
                        <Copyrights>
                            <CopyrightDiv data-html='copyright'>© 1999-2018, Rice University.
                                Except where otherwise noted,&nbsp;textbooks on this site are licensed under a
                                <BottomLink href='https://creativecommons.org/licenses/by/4.0/'>
                                    Creative Commons Attribution&nbsp;4.0 International License
                                </BottomLink>.
                            </CopyrightDiv>
                            <CopyrightDiv data-html='apStatement'>
                                Advanced Placement<sup>®</sup> and AP<sup>®</sup>
                                are trademarks registered and/or owned by the College Board,
                                which is not affiliated with,
                                and does not endorse, this site.
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
                            <BottomLink href='http://www.rice.edu'>
                                <FooterLogo src='/images/rice-white-text.png' alt='Rice University logo'/>
                            </BottomLink>
                        </Social>
                    </BottomBoxed>
                </FooterBottom>
            </InnerFooter>
        </FooterWrapper>;
    }
  }
