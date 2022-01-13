import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import icon from '../../../assets/kinetic.svg';
import Button from '../../components/Button';
import theme from '../../theme';

// tslint:disable-next-line: variable-name
const LabsCTAWrapper = styled.div`
  width: 100%;
  max-width: 82.5rem;
  margin: 0 auto 1.6rem;
  padding: 2.5rem;
  display: flex;
  align-items: center;
  background-color: #151B2C;
  ${theme.breakpoints.mobileSmall(css`
    flex-direction: column;
  `)}

  > *:not(:last-child) {
    margin-right: 4rem;
  }
`;

// tslint:disable-next-line: variable-name
const Column = styled.div`
  display: flex;
  ${(props) => props.flex ? css`flex: 1;` : null}
  flex-direction: column;
  color: ${theme.color.white};
  overflow: hidden;
  ${(props) => props.maxWidth ? css`max-width: ${props.maxWidth}rem;` : null}
`;

// tslint:disable-next-line: variable-name
const LabsText = styled.div`
  font-size: ${(props) => props.size}rem;
  font-weight: ${(props) => props.weight};
  line-height: ${(props) => props.lineHeight}rem;
`;

// tslint:disable-next-line: variable-name
const LabsCTALink = styled(Button)`
  background-color: #6922EA;
`;

// tslint:disable-next-line: variable-name
const LabsLogo = styled.img`
  height: 6rem;
`;

const variants = [
  [
    {
      maxWidth: 17,
      text: [
        {text: 'Kinetic by OpenStax:', size: 1.4, lineHeight: 1.6, weight: 500 as number | string},
        {text: 'Expand Your Learning Potential', size: 2, lineHeight: 2.4, weight: 500 as number | string},
      ],
    },
    {
      text: [
        {text: 'Explore innovative study tools designed to help you discover how you learn best.', size: 1.4, lineHeight: 2.2, weight: 'normal' as number | string},
      ],
    },
  ],
];

// tslint:disable-next-line: variable-name
const LabsCTA = () => {
  const config = variants[0];

  return (
    <LabsCTAWrapper>
      <Column>
        <LabsLogo src={icon} />
      </Column>
      <Column maxWidth={config[0].maxWidth}>
        {config[0].text.map(({text, ...params}, j) => <LabsText {...params} key={j}> {text}</LabsText>)}
      </Column>
      <Column flex>
        {config[1].text.map(({text, ...params}, j) => <LabsText {...params} key={j}> {text}</LabsText>)}
      </Column>
      <Column>
        <LabsCTALink
          component={<a />}
          variant='primary'
          size='large'
          target='_blank'
          rel='noopener'
          href='#'
        >
          <FormattedMessage id='i18n:toolbar:labs-cta:link'>
            {(msg) => msg}
          </FormattedMessage>
        </LabsCTALink>
      </Column>
    </LabsCTAWrapper>
  );
};

export default LabsCTA;
