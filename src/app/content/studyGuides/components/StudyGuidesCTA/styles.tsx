import styled, { css } from 'styled-components/macro';
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
  box-shadow: inset 0 0 10px 0 rgba(0, 0, 0, 0.4);
  overflow: hidden;

  strong {
    color: ${theme.color.secondary.deepGreen.base};
  }

  ${theme.breakpoints.mobile(css`
    height: 17.6rem;
    padding: 0 1.6rem;
  `)}
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
  margin: 0 0 1rem 0;
  ${theme.breakpoints.mobile(css`
    font-size: 1.8rem;
    line-height: 2.6rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAButtons = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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
  margin-right: 1.6rem;

  &:hover {
    background-color: ${theme.color.secondary.deepGreen.base};
  }

  ${theme.breakpoints.mobile(css`
    font-size: 1.4rem;
    width: 11rem;
    height: 3rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAButtonsSecondary = styled.div`
  padding: 1.4rem 0;
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTASeparator = styled.span`
  font-size: 1.6rem;
  text-transform: uppercase;
  margin-right: 1.6rem;
  ${theme.breakpoints.mobile(css`
    font-size: 1.4rem;
    margin-right: 1.2rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTALink = styled.a`
  font-size: 1.6rem;
  color: #027eb5;
  ${theme.breakpoints.mobile(css`
    font-size: 1.4rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAInfoWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  height: 100%;
  text-align: center;
  overflow: visible;
  position: relative;
  ${theme.breakpoints.mobile(css`
    justify-content: flex-end;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAInfo = styled.div`
  font-size: 1.8rem;
  line-height: 2.5rem;
  width: 24rem;
  margin-top: 2.5rem;
  z-index: 1;

  strong {
    display: block;
  }

  ${theme.breakpoints.mobile(css`
    width: 10rem;
    font-size: 1.2rem;
    line-height: 1.7rem;
    margin-top: 1.6rem;
    margin-right: 3.4rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAArrowDesktop = styled.img`
  position: absolute;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line: variable-name
export const StudyGuidesCTAArrowMobile = styled.img`
  position: absolute;
  right: -2.5rem;
  display: none;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;
