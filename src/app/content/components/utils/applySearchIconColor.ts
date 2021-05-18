import { css } from 'styled-components/macro';
import theme from '../../../theme';
import { SearchButtonColor } from '../../types';
import { toolbarIconColor } from '../constants';

export const applySearchIconColor = (props: {colorSchema: SearchButtonColor}) =>
  props.colorSchema ? css`
    color: ${theme.color.primary[props.colorSchema].foreground};

    :hover,
    :focus {
        color: ${theme.color.primary[props.colorSchema].foreground};

        ::before {
            content:"";
            display: block;
            height: 100%;
            position: absolute;
            top: 0;
            right: 0;
            min-width: 45px;
            background-color: rgba(0, 0, 0, 0.06)
            ;
        }
    }
  ` : css`
  color: ${toolbarIconColor.base};
`;
