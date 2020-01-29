import styled from 'styled-components';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import Button from '../../../components/Button';
import { textRegularStyle } from '../../../components/Typography';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';

// tslint:disable-next-line: variable-name
export const CTAWrapper = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 99;
  width: 100%;

  @media screen and (max-width: 1200px) {
    display: none;
  }
`;

// tslint:disable-next-line: variable-name
export const CTAContent = styled.div`
  position: absolute;
  z-index: 3;
  bottom: 0;
  width: 100%;
  display flex;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line: variable-name
export const CTAText = styled.div``;

// tslint:disable-next-line: variable-name
export const CTAHeading = styled.h2`
  ${textStyle}
  font-size: 3.6rem;
  line-height: 4rem;
  color: ${theme.color.text.white};
  margin: 0;
  max-width: 570px;
  overflow: hidden;
`;

// tslint:disable-next-line: variable-name
export const CTAParagraph = styled.p`
  ${textStyle}
  font-size: 1.8rem;
  line-height: 3rem;
  margin: 1rem 0;
  color: ${theme.color.text.white};
  max-width: 570px;
`;

// tslint:disable-next-line: variable-name
export const CTAButtons = styled.div`
  display: flex;
  align-items: center;
  ${Button} {
    width: 170px;
  }
`;

// tslint:disable-next-line: variable-name
export const CTATextLink = styled.span`
  ${textRegularStyle}
  color: ${theme.color.text.white};
  margin-left: 1.5rem;
  a {
    color: ${theme.color.text.white};
    text-decoration: underline;
    margin-left: 0.5rem;
  }
`;

// tslint:disable-next-line: variable-name
export const CTACloseButton = styled(Times)`
  position: absolute;
  top: 40%;
  right: 3rem;
  z-index: 3;
  width: 1.8rem;
  color: ${theme.color.text.white};
  cursor: pointer;
`;

// tslint:disable-next-line: variable-name
export const CTAGraphic = styled.img`
  margin-left: 3rem;
`;

// tslint:disable-next-line: variable-name
export const CTATopLayer = styled.img`
  position: absolute;
  right: -5px;
  bottom: 0;
  z-index: 2;
`;

// tslint:disable-next-line: variable-name
export const CTAMiddleLayer = styled.img`
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
`;

// tslint:disable-next-line: variable-name
export const CTABottomLayer = styled.img`
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 20px;
  z-index: 0;
`;

// tslint:disable-next-line: variable-name
export const CTABackground = styled.div`
  position: relative;
  height: 420px;
  overflow: hidden;
`;
