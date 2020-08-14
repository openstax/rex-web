import { css } from 'styled-components/macro';
import theme from '../../../theme';
import { BookWithOSWebData } from '../../types';

export const applyBookTextColor = (props: {colorSchema: BookWithOSWebData['theme'] | undefined }) =>
  props.colorSchema && css`
    color: ${theme.color.primary[props.colorSchema].foreground};
  `;
