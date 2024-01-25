import { assertWindow } from '../../../utils';

const doubleClick: {
  timer: number | undefined;
  lastHref: string;
} = {
  timer: undefined,
  lastHref: '',
};

export default function isDoubleClick(href: string) {
  const result = doubleClick.timer && doubleClick.lastHref === href;

  doubleClick.lastHref = href;
  assertWindow().clearTimeout(doubleClick.timer);
  doubleClick.timer = assertWindow().setTimeout(
    () => (doubleClick.lastHref = ''),
    500
  );

  return result;
}
