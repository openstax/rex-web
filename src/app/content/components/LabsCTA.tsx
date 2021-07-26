import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import Button from '../../components/Button';
import theme from '../../theme';

// tslint:disable-next-line: variable-name
const LabsCTAWrapper = styled.div`
  width: 100%;
  max-width: 82.5rem;
  margin: 0 auto 3rem;
  padding: 1.3rem 1.9rem;
  display: flex;
  align-items: center;
  background-color: ${theme.color.secondary.deepGreen.base};

  ${theme.breakpoints.mobileSmall(css`
    flex-direction: column;
`)}
`;

// tslint:disable-next-line: variable-name
const LabsCTAContent = styled.div`
  display: flex;
  flex-direction: column;
  color: ${theme.color.white};
  margin-right: 60px;

  ${theme.breakpoints.mobileSmall(css`
    margin-right: unset;
  `)}
`;

// tslint:disable-next-line: variable-name
const Heading = styled.div`
  font-size: 2.4rem;
  font-weight: bold;
`;

// tslint:disable-next-line: variable-name
const Text = styled.p`
  margin: 6px 0;
  font-size: 1.2rem;
`;

// tslint:disable-next-line: variable-name
const LabsCTALink = Button.withComponent('a');

// tslint:disable-next-line: variable-name
const LabsCTA = () => {
  return (
    <LabsCTAWrapper>
      <LabsCTAContent>
        <Heading>
          <FormattedMessage id='i18n:toolbar:labs-cta:heading'>
            {(msg) => msg}
          </FormattedMessage>
        </Heading>
        <Text>
          <FormattedMessage id='i18n:toolbar:labs-cta:text'>
            {(msg) => msg}
          </FormattedMessage>
        </Text>
      </LabsCTAContent>
      <LabsCTALink
        variant='primary'
        size='large'
        target='_blank'
        rel='noopener'
        href="#"
      >
        <FormattedMessage id='i18n:toolbar:labs-cta:link'>
          {(msg) => msg}
        </FormattedMessage>
      </LabsCTALink>
    </LabsCTAWrapper>
  );
};

export default LabsCTA;
