import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React, { LegacyRef } from 'react';
import { useIntl } from 'react-intl';
import styled from 'styled-components/macro';
import { match, not } from '../../../fpUtils';
import { highlightStyles } from '../../constants';
import { cardPadding } from '../constants';
import ColorIndicator from './ColorIndicator';
import type { HTMLDivElement, HTMLInputElement } from '@openstax/types/lib.dom';

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
    <input type='radio' {...props} />
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

function nextIdx(idx: number, itemCount: number, key: string) {
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
  return idx;
}

// tslint:disable-next-line:variable-name
const ColorPicker = ({className, ...props}: Props) => {
  const ref = React.useRef<HTMLDivElement>();
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role#keyboard_interactions
  const handleKeyNavigation = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }
      if (!ref.current) {
        return;
      }
      const activeElement = document?.activeElement as HTMLInputElement;
      const inputs = Array.from(ref.current.querySelectorAll('input'));
      const idx = inputs.indexOf(activeElement);
      const destIdx = nextIdx(idx, inputs.length, event.key);
      const el = inputs[destIdx];

      event.preventDefault();
      el.focus();
      el.click();
    },
    []
  );
  const initialFocus = React.useCallback(
    (event: React.FocusEvent) => {
      if (!ref.current || event.currentTarget !== event.target) {
        return;
      }
      const destEl = ref.current.querySelector<HTMLInputElement>('input[checked]');

      if (destEl) {
        destEl.focus();
      } else {
        ref.current.querySelector<HTMLInputElement>('input]')?.focus();
      }
    },
    []
  );

  // its important that this be click focusable, because when clicking
  // labels in chrome the focus is first moved to a background element
  // before the input, and that might cause weird behavior in parent
  // elements.
  return (
    <div
      className={className}
      tabIndex={0}
      role='radiogroup'
      aria-label='colors'
      ref={ref as unknown as LegacyRef<HTMLElement>}
      onKeyDown={handleKeyNavigation}
      onFocus={initialFocus}
    >
      {highlightStyles.map((style) => <ColorButton key={style.label}
        name={style.label}
        checked={props.multiple ? props.selected.includes(style.label) : props.color === style.label}
        style={style}
        size={props.size}
        tabindex={-1}
        onChange={() => props.multiple
          ? props.selected.includes(style.label)
            ? props.onChange(props.selected.filter(not(match(style.label))))
            : props.onChange([...props.selected, style.label])
          : props.color === style.label
            ? props.onRemove ? props.onRemove() : null
            : props.onChange(style.label)}
      />)}
    </div>
  );
};

export default styled(ColorPicker)`
  outline: none;
  display: flex;
  flex-direction: row;
  overflow: visible;
  gap: ${cardPadding}rem;
  padding: ${cardPadding}rem 0;
`;
