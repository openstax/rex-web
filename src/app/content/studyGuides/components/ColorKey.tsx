import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components/macro';
import colorKeyIcon from '../../../../assets/colorKeyIcon.png';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { PlainButton } from '../../../components/Button';
import { textRegularStyle } from '../../../components/Typography';
import theme from '../../../theme';
import { toolbarIconStyles } from '../../components/Toolbar/iconStyles';
import { toolbarDefaultText } from '../../components/Toolbar/styled';
import { highlightStyles } from '../../constants';
import ColorIndicator from '../../highlights/components/ColorIndicator';

const noteConstants = {
  noteHeight: 16.8,
  noteWidth: 35.3,
};

// tslint:disable-next-line:variable-name
export const ColorKeyButtonWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding-right: 2.4rem;
  position: relative;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
const ColorKeyDescription = styled.div`
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
  }

  height: ${noteConstants.noteHeight}rem;
  width: ${noteConstants.noteWidth}rem;
  box-sizing: border-box;
  border: 0.1rem solid ${theme.color.neutral.formBorder};
  box-shadow: 0 0.4rem 0.6rem 0 rgba(0,0,0,0.2);
  position: absolute;
  top: 4rem;
  right: 5rem;
  background: ${theme.color.white};
  overflow: visible;
  padding: 1.5rem 1.65rem
`;

// tslint:disable-next-line:variable-name
const ColorKeyIcon = styled.img`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const ColorKeyText = styled.span`
  ${toolbarDefaultText}
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
  margin-bottom: 0.2rem;

  ${ColorIndicator} {
    margin-top: 0.5rem;
  }
`;

// tslint:disable-next-line:variable-name
const ColorKey = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const trackOpenClose = useAnalyticsEvent('openCloseStudyGuides');

  const toggleColorKey = () => {
    setOpen((state) => !state);
    open ? trackOpenClose('button', true) : trackOpenClose(undefined, true);
  };

  return <FormattedMessage id='i18n:studyguides:popup:color-key'>
    {(msg: Element | string) =>
      <ColorKeyButtonWrapper onClick={toggleColorKey} aria-label={msg}>
        <ColorKeyIcon src={colorKeyIcon}/>
        <ColorKeyText>{msg}</ColorKeyText>
        {open && <ColorKeyDescription>
          {highlightStyles.filter((style) => style.label !== HighlightColorEnum.Pink)
            .map((color, index) =>
              <KeyTermWrapper key={index}>
                <ColorIndicator
                  shape='circle'
                  style={color}
                  size='small'
                  aria-label={color.label + ' key term'}
                  component={<label />}
                />
                <FormattedMessage id={'i18n:studyguides:popup:color-key:terms:' + color.label}>
                  {(key: string) =>
                    <KeyTermText>{key}</KeyTermText>
                  }
                </FormattedMessage>
              </KeyTermWrapper>
            )
          }
        </ColorKeyDescription>}
      </ColorKeyButtonWrapper>
    }
  </FormattedMessage>;
};

export default ColorKey;
