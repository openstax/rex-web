import { Highlight } from '@openstax/highlighter';
import React from 'react';
import styled from 'styled-components';
import { Check } from 'styled-icons/fa-solid/Check';
import { cardPadding, highlightStyles } from '../constants';

interface Props {
  highlight: Highlight;
  className?: string;
}

interface ColorButtonProps {
  name: string;
  checked: boolean;
  style: typeof highlightStyles[number];
  onClick: () => void;
  className?: string;
}

// tslint:disable-next-line:variable-name
const CheckIcon = styled(Check)`
  display: none;
  height: 1.6rem;
  width: 1.6rem;
`;

// tslint:disable-next-line:variable-name
const ColorButton = styled(({className, style, ...props}: ColorButtonProps) => <label className={className}>
  <input type='checkbox' {...props} />
  <CheckIcon />
</label>)`
  cursor: pointer;
  height: 2.4rem;
  width: 2.4rem;
  margin: 0 ${cardPadding}rem ${cardPadding}rem 0;
  background-color: ${(props: {style: typeof highlightStyles[number]}) => props.style.passive};
  border: 1px solid ${(props: {style: typeof highlightStyles[number]}) => props.style.focused};
  border-radius: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  input:checked + ${CheckIcon} {
    color: ${(props: {style: typeof highlightStyles[number]}) => props.style.focused};
    display: block;
  }
`;

// tslint:disable-next-line:variable-name
const ColorPicker = ({highlight, className}: Props) => {
  const [color, setColor] = React.useState<string | undefined>(highlight.getStyle());

  return <div className={className}>
    {highlightStyles.map((style) => <ColorButton key={style.label}
      name={style.label}
      checked={color === style.label}
      style={style}
      onChange={() => {
        highlight.setStyle(style.label);
        setColor(style.label);
      }}
    />)}
  </div>;
};

export default styled(ColorPicker)`
  display: flex;
  flex-direction: row;
`;
