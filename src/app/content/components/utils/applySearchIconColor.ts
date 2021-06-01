import { css } from 'styled-components/macro';
import theme from '../../../theme';
import { toolbarIconColor } from '../constants';

const primaryColors = theme.color.primary;

export const applySearchIconColor = (colorSchema: keyof typeof primaryColors | null) =>
  colorSchema ? css`
    color: ${primaryColors[colorSchema].foreground};

    :hover,
    :focus {
        color: ${primaryColors[colorSchema].foreground};

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
