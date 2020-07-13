import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { css } from 'styled-components/macro';
import colorKeyIcon from '../../../../assets/colorKeyIcon.png';
import { PlainButton } from '../../../components/Button';
import { textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { toolbarIconStyles } from '../../components/Toolbar/iconStyles';
import { toolbarDefaultText } from '../../components/Toolbar/styled';
import ColorIndicator from '../../highlights/components/ColorIndicator';
import { useOnClickOutside } from '../../highlights/components/utils/onClickOutside';
import { mobilePaddingSides } from '../../styles/PopupConstants';
import { highlightStyles } from '../constants';

const noteConstants = {
  noteHeight: 16.8,
  noteWidth: 37,
};

// tslint:disable-next-line:variable-name
export const ColorKeyButtonWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  position: relative;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
export const ColorKeyDescription = styled.div`
  ::before {
    content: "";
    position: absolute;
    width: 1.6rem;
    height: 1.6rem;
    transform: rotate(45deg);
    top: -0.9rem;
    right: 5.5rem;
    z-index: 1;
    background: ${theme.color.white};
    border-top: 0.1rem solid ${theme.color.neutral.formBorder};
    border-left: 0.1rem solid ${theme.color.neutral.formBorder};
    ${theme.breakpoints.mobile(css`
      right: 6rem;
      width: 1rem;
      height: 1rem;
      top: -0.6rem;
    `)}
  }

  min-height: ${noteConstants.noteHeight}rem;
  width: ${noteConstants.noteWidth}rem;
  max-width: ${noteConstants.noteWidth}rem;
  box-sizing: border-box;
  border: 0.1rem solid ${theme.color.neutral.formBorder};
  box-shadow: 0 0.4rem 0.6rem 0 rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 4rem;
  right: 2.5rem;
  background: ${theme.color.white};
  overflow: visible;
  padding: 1.5rem 1.65rem;
  ${theme.breakpoints.mobile(css`
    width: calc(100vw - ${mobilePaddingSides * 2}rem);
    right: -5.3rem;
    top: 3.5rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const ColorKeyIcon = styled.img`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const ColorKeyText = styled.span`
  ${toolbarDefaultText};
  color: ${theme.color.primary.gray.base};

  :active,
  :focus {
    color: ${theme.color.primary.gray.base};
  }
`;

// tslint:disable-next-line:variable-name
const KeyTermText = styled.span`
  ${textRegularStyle}
  font-size: 1.4rem;
  letter-spacing: -0.4px;
  margin-left: 1.6rem;
  width: 100%;
  text-align: left;
`;

// tslint:disable-next-line:variable-name
const KeyTermWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.5rem 0;

  ${ColorIndicator} {
    margin-top: 0.5rem;
    width: 1.8rem;
  }
`;

// tslint:disable-next-line:variable-name
const ColorKeyWrapper = styled.div`
  outline: none;
  margin-left: auto;
  margin-right: 4.8rem;
  position: relative;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    margin-right: ${mobilePaddingSides}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const ColorKey = () => {
  const [open, setOpen] = React.useState(false);
  const colorKeyRef = React.useRef<HTMLElement>(null);

  const toggleColorKey = () => {
    setOpen((state) => !state);
  };

  const closeColorKey = () => { setOpen(false); };

  useOnClickOutside(colorKeyRef, true, closeColorKey);

  return <ColorKeyWrapper ref={colorKeyRef}>
    <FormattedMessage id='i18n:studyguides:popup:color-key'>
      {(msg: Element | string) =>
        <ColorKeyButtonWrapper onClick={toggleColorKey} aria-label={msg}>
          <ColorKeyIcon src={colorKeyIcon}/>
          <ColorKeyText>{msg}</ColorKeyText>
        </ColorKeyButtonWrapper>
      }
    </FormattedMessage>
    {open && <ColorKeyDescription>
      {highlightStyles.map((color, index) =>
        <KeyTermWrapper key={index}>
          <FormattedMessage id='i18n:studyguides:popup:color-key:terms:aria-label' values={{color: color.label}}>
            {(arialabel: string) => <ColorIndicator
              shape='circle'
              style={color}
              size='small'
              aria-label={arialabel}
              component={<label />}
            />}
          </FormattedMessage>
          <FormattedMessage id={'i18n:studyguides:popup:color-key:terms:' + color.label}>
            {(key: string) => <KeyTermText>{key}</KeyTermText>}
          </FormattedMessage>
        </KeyTermWrapper>
      )}
    </ColorKeyDescription>}
  </ColorKeyWrapper>;
};

export default ColorKey;
