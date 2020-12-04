import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import { textRegularStyle } from '../../../components/Typography';

// tslint:disable-next-line: variable-name
const StyledFinalScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 38rem;
  margin: 2rem auto;
  flex: 1;
  text-align: center;
  ${textRegularStyle}
`;

// tslint:disable-next-line: variable-name
const StyledText = styled.span`
  margin-bottom: 3rem;
`;

const FinalScreen = () => {
    return <StyledFinalScreen>
        <StyledText>
            <FormattedMessage id='i18n:practice-questions:popup:final'>
                {(msg: string) => msg}
            </FormattedMessage>
        </StyledText>
    </StyledFinalScreen>
}

export default FinalScreen;