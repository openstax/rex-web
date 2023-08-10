import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import theme from '../../theme';
import { setTextSize } from '../actions';
import * as selectContent from '../selectors';
import { LinkedArchiveTreeSection } from '../types';
import { shadow, TopBarWrapper } from './Topbar/styled';
import { TextResizer } from './Topbar/TextResizer';
import { topbarDesktopHeight, topbarMobileHeight } from './constants';

// tslint:disable-next-line:variable-name
const StyledTopBarWrapper = styled(TopBarWrapper)`
  ${shadow}

  && {
    top: 0;
  }

  background-color: ${theme.color.neutral.base};
  color: ${theme.color.text.default};
  display: flex;
  height: ${topbarDesktopHeight}rem;
  ${theme.breakpoints.mobileMedium(css`
    height: ${topbarMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const StyledSectionTitle = styled.h2`
  font-size: 1.8rem;
  line-height: 2.1rem;
  letter-spacing: 0.03px;
  margin-left: 1.6rem;
  ${theme.breakpoints.mobile(css`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `)}
`;

// tslint:disable-next-line:variable-name
export const AssignedTopBar = (props: {
  section: LinkedArchiveTreeSection;
}) => {

  const bookTheme = useSelector(selectContent.bookTheme);
  const textSize = useSelector(selectContent.textSize);
  const dispatch = useDispatch();

  return (
    <StyledTopBarWrapper>
      <StyledSectionTitle dangerouslySetInnerHTML={{ __html:  props.section?.title }} />
      <TextResizer
        bookTheme={bookTheme}
        setTextSize={(value) => dispatch(setTextSize(value))}
        textSize={textSize}
        data-testid='text-resizer'
        mobileToolbarOpen={false}
        mobileVariant={false}
      />
    </StyledTopBarWrapper>
  );
};
