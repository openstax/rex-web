import { MouseEvent } from '@openstax/types/lib.dom';

export default  (e: React.MouseEvent | MouseEvent) => e.shiftKey || e.ctrlKey || e.metaKey || e.altKey;
