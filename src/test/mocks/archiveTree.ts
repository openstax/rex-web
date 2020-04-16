import { ArchiveTree } from '../../app/content/types';
import makeArchiveSection from './archiveSection';

export default (title: string, contents: ArchiveTree['contents']): ArchiveTree => ({
  ...makeArchiveSection(title),
  contents,
});
