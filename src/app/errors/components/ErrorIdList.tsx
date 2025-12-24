import React from 'react';
import styled from 'styled-components/macro';
import { labelStyle } from '../../components/Typography';
import theme from '../../theme';

const ErrorIdList = styled.div`
  ${labelStyle}
  font-size: 0.9rem;
  color: ${theme.color.primary.gray.darker};
  opacity: 0.6;
`;

export default ({ids}: {ids: string[]}) => ids.length > 0
  ? <ErrorIdList>{ids.slice(0, 4).join(', ')}</ErrorIdList>
  : null;
