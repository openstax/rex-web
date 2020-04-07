import { ArchiveTreeSection } from '../../app/content/types';

export default (title: string): ArchiveTreeSection => ({
  id: `${title}-id`,
  shortId: `${title}-shortid`,
  slug: `${title}-slug`,
  title,
});
