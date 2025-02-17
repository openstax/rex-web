
declare module 'rangy' {
  export interface RangyRange extends NativeRange {
    nativeRange: NativeRange;
    setStartAndEnd(startNode: Node, startOffset: number, endNode?: Node, endOffset?: number): unknown;
    setStartAndEnd(startNode: Node, startOffset: number, endOffset: number): unknown;
    canSurroundContents(): boolean;
    isValid(): boolean;
    toHtml(): string;
    compareNode(node: Node): unknown;
    intersectsOrTouchesRange(range: RangyRange): boolean;
    intersectsRange(range: RangyRange): boolean;
    intersection(range: RangyRange): RangyRange;
    cloneRange<T extends RangyRange>(this: T): T;
    union(range: RangyRange): RangyRange;
    containsNode(node: Node, partial: boolean): boolean;
    containsNodeContents(node: Node): boolean;
    containsNodeText(node: Node): boolean;
    containsRange(range: RangyRange): boolean;
    splitBoundaries(): unknown;
    normalizeBoundaries(): unknown;
    collapseToPoint(node: Node, offset: number): unknown;
    collapseBefore(node: Node): unknown;
    collapseAfter(node: Node): unknown;
    getNodes(nodeTypes?: unknown[], filter?: (node: Node) => boolean): Node[];
    getBookmark(containerNode?: Node): {start: number, end: number};
    getDocument(): Document;
    inspect(): string;
    equals(range: RangyRange): boolean;
    refresh(): unknown;
    select(): unknown;
    toCharacterRange(containerNode: Node, opts?: unknown): {start: number, end: number};
  }

  export interface TextRange {
    findText: (searchTerm: string, options?: {
      caseSensitive?: boolean,
      withinRange?: NativeRange | RangyRange,
      wholeWordsOnly?: boolean,
      wrap?: boolean,
      direction?: 'backward' | 'forward',
    }) => boolean;
  }

  export interface RangyStatic<R extends RangyRange = RangyRange> {
    initialized: boolean;
    init: () => void;
    supported: boolean;
    createNativeRange(doc?: Document | Window | HTMLIFrameElement): Range;
    createRange(doc?: Document | Window | HTMLIFrameElement): R;
    createRangyRange(doc?: Document | Window | HTMLIFrameElement): R;
    getNativeSelection(win?: Window): Selection;
    getSelection(doc?: Document | Window | HTMLIFrameElement): RangySelection;
    addInitListener(listener: (rangy: RangyStatic) => void): unknown;
    shim(): unknown;
    createMissingNativeApi(): unknown;
  }

  export default rangy;
  declare const rangy: RangyStatic;
  type NativeRange = import ('@openstax/types/lib.dom').Range;
}
