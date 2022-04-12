import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import icon from '../../../assets/kinetic.svg';
import Button from '../../components/Button';
import theme from '../../theme';
import { disablePrint } from './utils/disablePrint';

// tslint:disable-next-line: variable-name
const LabsLogo = styled.img`
  width: 5.5rem;
`;

// tslint:disable-next-line: variable-name
const LabsCallWrapper = styled.div`
  width: 100%;
  max-width: 82.5rem;
  margin: 0 auto 1.6rem;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  background-color: #151b2c;
  ${theme.breakpoints.mobileMedium(css`
    padding: 1.6rem;
    align-items: flex-start;
    flex-direction: column;
  `)}
  ${disablePrint}
`;

/* stylelint-disable block-opening-brace-newline-after, block-closing-brace-newline-before */
/* stylelint-disable block-opening-brace-space-after, block-closing-brace-space-before */
// tslint:disable-next-line: variable-name
const Column = styled.div`
  display: flex;
  ${(props) => props.flex ? css`flex: 1;` : null}
  flex-direction: column;
  color: ${theme.color.white};
  overflow: hidden;
  ${(props) => props.maxWidth ? css`max-width: ${props.maxWidth}rem;` : null}
  ${(props) => !props.last ? css`
    margin-right: 2.5rem;
    ${theme.breakpoints.mobileMedium(css`
      margin-right: 0;
      margin-bottom: 3rem;
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
  ${theme.breakpoints.mobileMedium(css`
    width:100%;
    align-items: center;

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
  ${(props) => props.size === 'h2' ? css`
      font-size: 2rem;
      font-weight: 500;
      line-height: 2.4rem;
      ${theme.breakpoints.mobileMedium(css`
        font-size: 1.7rem;
        line-height: 2rem;
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
`;

// tslint:disable-next-line: variable-name
const LabsCTA = () =>
  <LabsCallWrapper>
    <LabsCallHeader>
      <Column>
        <LabsLogo src={icon} role='img' alt='' />
      </Column>
      <Column maxWidth={17}>
        <LabsText size={'h2'}>Do you know how you learn best?</LabsText>
      </Column>
    </LabsCallHeader>
    <Column flex>
      <LabsText size={'text'}>
        Kinetic by OpenStax offers access to innovative study tools designed
        to help you maximize your learning potential.
      </LabsText>
    </Column>
    <Column last>
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
  </LabsCallWrapper>;

export default LabsCTA;
