import React from 'react';
import styled from 'styled-components/macro';
import { match, not } from '../../../fpUtils';
import { cardPadding, highlightStyles } from '../constants';
import ColorIndicator from './ColorIndicator';

interface SingleSelectProps {
  color?: string;
  onRemove: () => void;
  onChange: (color: string) => void;
  multiple: false | undefined;
}

interface MultipleSelectProps {
  selected: string[];
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
const ColorButton = styled(({className, size, style, ...props}: ColorButtonProps) => <ColorIndicator
  style={style}
  size={size}
  component={<label />}
  className={className}
>
  <input type='checkbox' {...props} />
</ColorIndicator>)`
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

  return <div className={className}>
    {highlightStyles.map((style) => <ColorButton key={style.label}
      name={style.label}
      checked={props.multiple ? props.selected.includes(style.label) : props.color === style.label}
      style={style}
      onChange={() => props.multiple
        ? props.selected.includes(style.label)
          ? props.onChange(props.selected.filter(not(match(style.label))))
          : props.onChange([...props.selected, style.label])
        : props.color === style.label
          ? props.onRemove()
          : props.onChange(style.label)}
    />)}
  </div>;
};

export default styled(ColorPicker)`
  display: flex;
  flex-direction: row;
`;
