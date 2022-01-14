import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import icon from '../../../assets/kinetic.svg';
import Button from '../../components/Button';
import { kineticBannerVariant } from '../../featureFlags/selectors';
import theme from '../../theme';

// tslint:disable-next-line: variable-name
const LabsLogo = styled.img`
  width: 5.5rem;
`;

// tslint:disable-next-line: variable-name
const LabsCTAWrapper = styled.div`
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
const LabsCTAHeader = styled.div`
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
  ${(props) => props.size === 'h1' ? css`
      font-size: 1.4rem;
      font-weight: 500;
      line-height: 1.6rem;
    ` : props.size === 'h2' ? css`
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
const LabsCTALink = styled(Button)`
  background-color: #6922ea;
`;

const variants = [
  [
    {
      maxWidth: 17,
      text: [
        {text: 'Kinetic by OpenStax:', size: 'h1'},
        {text: 'Expand Your Learning Potential', size: 'h2'},
      ],
    },
    {
      text: [
        {
          size: 'text',
          text: 'Explore innovative study tools designed to help you discover how you learn best.',
        },
      ],
    },
  ],
  [
    {
      maxWidth: 17,
      text: [
        {text: 'Do you know how you learn best?', size: 'h2'},
      ],
    },
    {
      text: [
        {
          size: 'text',
          text: 'Kinetic by OpenStax offers access to innovative study tools designed' +
                ' to help you maximize your learning potential.',
        },
      ],
    },
  ],
  [
    {
      maxWidth: 25,
      text: [
        {text: 'Kinetic by OpenStax:', size: 'h1'},
        {text: 'A brighter future for digital education starts here.', size: 'h2'},
      ],
    },
    {
      text: [
        {
          size: 'text',
          text: 'See how you can help us create better online learning tools optimized to help everyone grow.',
        },
      ],
    },
  ],
];

// tslint:disable-next-line: variable-name
const LabsCTA = () => {
  const variant = useSelector(kineticBannerVariant);
  const config = typeof variant === 'number' && variants[variant];

  if (!config) {
    return null;
  }

  return (
    <LabsCTAWrapper data-experiment={true}>
      <LabsCTAHeader>
        <Column>
          <LabsLogo src={icon} />
        </Column>
        <Column maxWidth={config[0].maxWidth}>
          {config[0].text.map(({text, ...params}, j) => <LabsText {...params} key={j}> {text}</LabsText>)}
        </Column>
      </LabsCTAHeader>
      <Column flex>
        {config[1].text.map(({text, ...params}, j) => <LabsText {...params} key={j}> {text}</LabsText>)}
      </Column>
      <Column last>
        <LabsCTALink
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
    </LabsCTAWrapper>
  );
};

export default LabsCTA;
