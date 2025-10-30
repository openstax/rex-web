import React from 'react';
import styled from 'styled-components/macro';
import { ButtonGroup } from '../../components/Button';
import { bodyCopyRegularStyle } from '../../components/Typography';
import { disablePrint } from '../../content/components/utils/disablePrint';
import theme from '../../theme';
import { inlineDisplayBreak, inlineDisplayMediumBreak } from '../theme';

const notificationWidth = 30;

// tslint:disable-next-line:variable-name
export const Group = styled.div`
  width: 100%;

  ${ButtonGroup} {
    padding: 1rem;
    margin: 0;
  }

  @media (max-width: ${inlineDisplayBreak}) {
    > ${ButtonGroup} {
      display: block;
      padding: ${theme.padding.page.mobile}rem 0 0 0;
    }
  }
`;

// tslint:disable-next-line:variable-name
export const P = styled.p`
  ${bodyCopyRegularStyle}
  margin: 1rem 0 0 0;
  padding: 1rem;

  @media (max-width: ${inlineDisplayBreak}) {
    padding: 0;
  }
`;

// tslint:disable-next-line:variable-name
export const Body = styled(({className, ...props}) =>
  <div className={className}><div {...props} /></div>)`
  width: ${notificationWidth}rem;
  margin-left: calc(100% - ${notificationWidth}rem);
  overflow: visible;
  position: sticky;
  padding-top: 1px; /* clear child margin */
  margin-top: -1px; /* clear child margin */
  z-index: ${theme.zIndex.contentNotifications};
  top: 0;
  height: 0;

  @media (max-width: ${inlineDisplayBreak}) {
    box-shadow: inset 0 -0.2rem 0.2rem 0 rgba(0, 0, 0, 0.14);
    background-color: ${theme.color.neutral.darker};
    margin: 0;
    height: auto;
    width: 100%;
    padding: 1.5rem 0;
  }

  > div {
    margin: 0.5rem;
    background-color: ${theme.color.neutral.base};
    border-style: solid;
    border-color: ${theme.color.neutral.darkest};
    display: flex;
    flex-basis: 100%;
    flex-direction: column;
    border-width: thin;
    box-shadow: 0 1rem 2rem 0 rgba(0, 0, 0, 0.2);
    overflow: visible;

    > ${ButtonGroup} {
      padding: 1rem;
      margin: 2.5rem 0 0 0;

      @media (max-width: ${inlineDisplayMediumBreak}) {
        margin: 4rem 0 0 0;
      }
    }

    @media (max-width: ${inlineDisplayBreak}) {
      margin: ${theme.padding.page.mobile}rem;
      box-shadow: none;
      border: none;
      flex-direction: row;
      background-color: initial;

      > ${ButtonGroup} {
        padding: 0;
      }
    }
  }

  ${disablePrint}
`;

// tslint:disable-next-line:variable-name
export const Header = styled.div`
  ${bodyCopyRegularStyle}
  padding: 0.5rem 1rem;
  font-weight: bold;
  background-color: ${theme.color.neutral.darker};
  line-height: 4rem;

  @media (max-width: ${inlineDisplayBreak}) {
    padding: 0;
    line-height: 2rem;
    background-color: initial;
  }
`;
