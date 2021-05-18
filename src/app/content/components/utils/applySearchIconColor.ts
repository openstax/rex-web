import { css } from 'styled-components/macro';
import theme from '../../../theme';
import { SearchButtonColor } from '../../types';
import { toolbarIconColor } from '../constants';

export const applySearchIconColor = (props: {colorSchema: SearchButtonColor}) =>
  props.colorSchema === 'transparent' ? css`
    color: ${toolbarIconColor.base};
  ` : css`
    color: ${theme.color.primary[props.colorSchema].foreground};

    :hover,
    :focus {
        color: ${theme.color.primary[props.colorSchema].foreground}
    }
  `;
