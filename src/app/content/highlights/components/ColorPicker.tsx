import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import { match, not } from '../../../fpUtils';
import { highlightStyles } from '../../constants';
import { cardPadding } from '../constants';
import ColorIndicator from './ColorIndicator';
import { HTMLDivElement, HTMLInputElement } from '@openstax/types/lib.dom';

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
    <input type='checkbox' role='radio' aria-checked={props.checked} {...props} />
  </ColorIndicator>;
})`
  cursor: pointer;
  margin: 0;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
`;

type NavKeys = 'Home' | 'End' | 'ArrowLeft' | 'ArrowRight' | ' ' | 'Enter';

function nextIdx(idx: number, itemCount: number, key: NavKeys) {
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return itemCount - 1;
  }
  if (key === 'ArrowLeft') {
    return (idx + itemCount - 1) % itemCount;
  }
  if (key === 'ArrowRight') {
    return (idx + 1) % itemCount;
  }
  // Just toggle
  return idx;
}

// tslint:disable-next-line:variable-name
const ColorPicker = ({className, ...props}: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role#keyboard_interactions
  const handleKeyNavigation = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End', ' ', 'Enter'].includes(event.key)) {
        return;
      }
      const assertedRef = ref as React.MutableRefObject<HTMLDivElement>;
      const activeElement = document?.activeElement as HTMLInputElement;
      const inputs = Array.from(assertedRef.current.querySelectorAll('input'));
      const idx = inputs.indexOf(activeElement);
      const destIdx = nextIdx(idx, inputs.length, event.key as NavKeys);
      const el = inputs[destIdx];

      event.preventDefault();
      el.focus();
      el.click();
    },
    []
  );
  const color = (props as SingleSelectProps).color;
  const focusOnSelected = React.useCallback(
    () => {
      if (color && document?.activeElement === ref.current) {
        ref.current?.querySelector<HTMLInputElement>(`input[name="${color}"]`)?.focus();
      }
    },
    [color]
  );

  React.useEffect(focusOnSelected, [focusOnSelected]);

  return (
    <fieldset
      className={className}
      tabIndex={0}
      ref={ref}
      onKeyDown={handleKeyNavigation}
      onFocus={focusOnSelected}
    >
      <legend>Choose highlight color</legend>
      {highlightStyles.map((style) => <ColorButton key={style.label}
        name={style.label}
        checked={props.multiple ? props.selected.includes(style.label) : props.color === style.label}
        style={style}
        size={props.size}
        tabIndex={-1}
        onChange={() => props.multiple
          ? props.selected.includes(style.label)
            ? props.onChange(props.selected.filter(not(match(style.label))))
            : props.onChange([...props.selected, style.label])
          : props.color === style.label
            ? props.onRemove ? props.onRemove() : null
            : props.onChange(style.label)}
      />)}
    </fieldset>
  );
};

export default styled(ColorPicker)`
  border: 0;
  outline: none;
  display: flex;
  flex-direction: row;
  overflow: visible;
  gap: ${cardPadding}rem;
  padding: ${cardPadding}rem 0.3rem;

  legend {
    position: absolute;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
  }
`;
