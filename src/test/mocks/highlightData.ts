import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { HighlightData } from '../../app/content/highlights/types';

const defaultData = {
  color: HighlightColorEnum.Blue,
  id: Math.random().toString(36),
  sourceId: 'testbook1-testpage1-uuid',
};

const createMockHighlightData = (data: Partial<HighlightData> = {}) => ({
  ...defaultData,
  ...data,
} as HighlightData);

export default createMockHighlightData;
