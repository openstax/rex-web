import { ArchiveTreeSection } from '../../app/content/types';

export default (title: string): ArchiveTreeSection => ({
  id: `${title}-id`,
  slug: `${title}-slug`,
  title,
});
