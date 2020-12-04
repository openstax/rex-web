import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';

// tslint:disable-next-line: variable-name
const StyledText = styled.span`
  margin-bottom: 3rem;
`;
const FinalScreen = () => {
    return (
        <StyledText>
            <FormattedMessage id='i18n:practice-questions:popup:final'>
                {(msg: string) => msg}
            </FormattedMessage>
        </StyledText>
    );

}

export default FinalScreen;