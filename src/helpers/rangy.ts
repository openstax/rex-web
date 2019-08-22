import rangy, { RangyRange, RangyStatic, TextRange } from 'rangy';
import 'rangy/lib/rangy-textrange';

export default rangy as RangyStatic<RangyRange & TextRange>;
