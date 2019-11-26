import { SerializedHighlight } from '@openstax/highlighter';

export type HighlightData = SerializedHighlight['data'] & {
  note?: string;
};

export interface State {
  myHighlightsOpen: boolean;
  enabled: boolean;
  focused?: string;
  highlights: HighlightData[];
  summary: {
    filters: {
      colors: string[];
      chapters: string[];
    },
    loading: boolean;
    chapterCounts: {[key: string]: number};
    highlights: {
      [chapterId: string]: {[pageId: string]: HighlightData[]}
    };
  };
}
