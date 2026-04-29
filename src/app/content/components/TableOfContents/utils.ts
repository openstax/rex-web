import { splitTitleParts } from '../../utils/archiveTreeUtils';
import { ArchiveTree } from '../../types';

/* to regenerate these numbers, run this in a rex browser window
(
  (element) => 'wW1234567890.'.split('').reduce(
    (result, char) => (result[char] = ((element.innerText = char) && element.getBoundingClientRect().width)) && result,
    {}
  )
)(element = document.querySelector('[data-testid=toc] a[aria-current="page"]')
  .appendChild(document.createElement('span'))
);
 */
const numberCharacterWidth = .890625;
const letterCharacterWidth = 1.5109375;
const numberPeriodWidth = .4453125;
export const dividerWidth = .8;

const getNumberWidth = (contents: ArchiveTree['contents']) => contents.reduce((result, { title }) => {
  const num = splitTitleParts(title)[0];

  if (!num) {
    return result;
  }
  const letters = num.replace(/[^A-Z]/ig, '');
  const numbers = num.replace(/[^0-9]/g, '');
  const periods = num.replace(/[^.]/g, '');

  return Math.max(result,
    numbers.length * numberCharacterWidth +
    letters.length * letterCharacterWidth +
    periods.length * numberPeriodWidth
  );
}, 0);

export default getNumberWidth;
