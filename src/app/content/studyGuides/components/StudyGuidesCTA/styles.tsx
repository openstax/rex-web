import styled from 'styled-components/macro';
import Button from '../../../../components/Button';
import theme from '../../../../theme';

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAWrapper = styled.div`
  display: flex;
  height: 20rem;
  padding: 0 8rem;
  justify-content: space-between;
  align-items: center;
  color: ${theme.color.text.default};
  box-shadow: inset 0 0 10px 0 rgba(0,0,0,0.4);

  strong {
    color: ${theme.color.secondary.deepGreen.base};
  }
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTATitle = styled.h2`
  font-size: 2.4rem;
  margin: 0 0 1.6rem 0;
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAButtons = styled.div`
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAButton = styled(Button)`
  width: 24rem;
  height: 4.8rem;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 600;
  color: ${theme.color.text.white};
  background-color: ${theme.color.secondary.deepGreen.base};
  border: none;

  &:hover {
    background-color: ${theme.color.secondary.deepGreen.base};
  }
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTASeparator = styled.span`
  font-size: 1.6rem;
  text-transform: uppercase;
  margin: 0 1.6rem;
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTALink = styled.a`
  font-size: 1.6rem;
  color: #027EB5;
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAArrow = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  text-align: center;
  overflow: visible;
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAInfo = styled.div`
  font-size: 1.8rem;
  line-height: 2.5rem;
  margin-top: -5rem;
`;
