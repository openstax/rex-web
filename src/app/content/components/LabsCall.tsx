import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import KineticCTAMobile from '../../../assets/kinetic-cta-mobile.svg';
import KineticCTA from '../../../assets/kinetic-cta.svg';
import icon from '../../../assets/kinetic-logo.png';
import Button from '../../components/Button';
import { kineticBannerEnabled } from '../../featureFlags/selectors';
import theme from '../../theme';
import { disablePrint } from './utils/disablePrint';

// tslint:disable-next-line: variable-name
const LabsLogo = styled.img`
  width: 10.7rem;
`;

// tslint:disable-next-line: variable-name
const LabsCallWrapper = styled.div`
  width: 100%;
  max-width: 82.5rem;
  min-height: 12rem;
  margin: 0 auto 1.6rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  background-repeat: no-repeat;
  background-image: url(${KineticCTA});
  background-position: top right;
  background-size: cover;
  box-shadow: inset 0 0 0 1px #cacaca;
  ${theme.breakpoints.mobileMedium(css`
    background-position: center center;
    padding: 4.5rem 2.3rem 3.5rem;
    align-items: flex-start;
    flex-direction: column;
  `)}
  ${theme.breakpoints.mobileSmall(css`
    background-image: url(${KineticCTAMobile});
    padding: 2rem 1.2rem 2.8rem;
  `)}
  ${disablePrint}
`;

/* stylelint-disable block-opening-brace-newline-after, block-closing-brace-newline-before */
/* stylelint-disable block-opening-brace-space-after, block-closing-brace-space-before */
// tslint:disable-next-line: variable-name
const Column = styled.div`
  display: flex;
  flex-direction: column;
  color: ${theme.color.primary.gray.darker};
  overflow: hidden;
  ${(props) => props.maxWidth ? css`max-width: ${props.maxWidth}rem;` : null}
  ${(props) => props.noShrink ? css`flex-shrink: 0;` : null}
  ${(props) => !props.last ? css`
    margin-right: 2.5rem;

    ${theme.breakpoints.mobileMedium(css`
      margin-right: 0;
      margin-bottom: 2.4rem;
    `)}
    ${theme.breakpoints.mobile(css`
      margin-right: 0;
    `)}
  ` : null}

  ${theme.breakpoints.mobileMedium(css`
    margin-right: 0;
    max-width: unset;
  `)}
`;

// tslint:disable-next-line: variable-name
const LabsCallHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;

  ${Column} {
    margin-right: 1.4rem;
  }

  ${theme.breakpoints.mobileMedium(css`
    align-items: initial;
    flex-direction: column;

    ${LabsLogo} {
      margin-right: 2.5rem;
    }
  `)}
`;

// tslint:disable-next-line: variable-name
const LabsText = styled.div`
  font-size: ${(props) => props.size}rem;
  font-weight: ${(props) => props.weight};
  line-height: ${(props) => props.lineHeight}rem;
  ${(props) => props.maxWidth ? css`max-width: ${props.maxWidth}rem;` : null}
  ${(props) => props.size === 'h2' ? css`
      font-size: 1.8rem;
      font-weight: 500;
      line-height: 2.6rem;
      ${theme.breakpoints.mobileMedium(css`
        margin-right: 10rem;
        max-width: 34rem;
        margin-right: 6rem;
      `)}
      ${theme.breakpoints.mobileSmall(css`
        max-width: 40rem;
        font-size: 1.7rem;
        line-height: 2.2rem;
      `)}
    ` : css`
      font-size: 1.4rem;
      line-height: 2.2rem;
    `
  }
`;

// tslint:disable-next-line: variable-name
const LabsCallLink = styled(Button)`
  background-color: #6922ea;
  border-radius: 4px;
  height: 4rem;
`;

// tslint:disable-next-line: variable-name
const LabsCTA = () => {
  const enabled = useSelector(kineticBannerEnabled);

  if (!enabled) {
    return null;
  }

  return (
    <LabsCallWrapper data-async-content>
      <LabsCallHeader>
        <Column noShrink>
          <LabsLogo src={icon} role='img' alt='' />
        </Column>
        <Column maxWidth={35.4}>
          <LabsText size={'h2'}>
            Win prizes by participating in research and discover more insights about yourself!
          </LabsText>
        </Column>
      </LabsCallHeader>
      <Column last maxWidth={13.6}>
        <LabsCallLink
          component={<a href='/kinetic/'>
            <FormattedMessage id='i18n:toolbar:labs-cta:link'>
              {(msg) => msg}
            </FormattedMessage>
          </a>}
          data-analytics-label='kinetic-banner'
          variant='primary'
          size='large'
          target='_blank'
          rel='noopener'
        />
      </Column>
    </LabsCallWrapper>
  );
};

export default LabsCTA;
