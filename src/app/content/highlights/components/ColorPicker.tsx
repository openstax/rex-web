import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import { match, not } from '../../../fpUtils';
import { highlightStyles } from '../../constants';
import { cardPadding } from '../constants';
import ColorIndicator from './ColorIndicator';

interface SingleSelectProps {
  color?: HighlightColorEnum;
  onRemove?: () => void;
  onChange: (color: HighlightColorEnum) => void;
  multiple: false | undefined;
}

interface MultipleSelectProps {
  selected: HighlightColorEnum[];
  onChange: (selected: string[]) => void;
  multiple: true;
}

type Props = (SingleSelectProps | MultipleSelectProps) & {
  className?: string;
  size?: 'small';
};

interface ColorButtonProps {
  name: string;
  checked: boolean;
  size: Props['size'];
  style: typeof highlightStyles[number];
  onClick: () => void;
  className?: string;
}

// tslint:disable-next-line:variable-name
const ColorButton = styled(({className, size, style, ...props}: ColorButtonProps) => {
  const color = useIntl().formatMessage({id: `i18n:highlighting:colors:${style.label}`});

  return <ColorIndicator
    style={style}
    size={size}
    title={color}
    aria-label={useIntl().formatMessage({id: 'i18n:highlighting:change-color'}, {color})}
    checked={props.checked}
    component={<label />}
    className={className}
  >
    <input type='checkbox' {...props} />
  </ColorIndicator>;
})`
  cursor: pointer;
  margin: 0 ${cardPadding}rem ${cardPadding}rem 0;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
`;

// tslint:disable-next-line:variable-name
const ColorPicker = ({className, ...props}: Props) => {

  // its important that this be click focusable, because when clicking
  // labels in chrome the focus is first moved to a background element
  // before the input, and that might cause weird behavior in parent
  // elements.
  return <div className={className} tabIndex={-1}>
    {highlightStyles.map((style) => <ColorButton key={style.label}
      name={style.label}
      checked={props.multiple ? props.selected.includes(style.label) : props.color === style.label}
      style={style}
      size={props.size}
      onChange={() => props.multiple
        ? props.selected.includes(style.label)
          ? props.onChange(props.selected.filter(not(match(style.label))))
          : props.onChange([...props.selected, style.label])
        : props.color === style.label
          ? props.onRemove ? props.onRemove() : null
          : props.onChange(style.label)}
    />)}
  </div>;
};

export default styled(ColorPicker)`
  outline: none;
  display: flex;
  flex-direction: row;
  overflow: visible;
`;
