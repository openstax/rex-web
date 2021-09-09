export const stripIdVersion = (id: string): string => id.split('@')[0];
export const stripArchiveVersion = (id: string): string[] => id.split('__');
export const getIdVersion = (id: string): string | undefined =>
    stripArchiveVersion(id).length > 1 ? stripArchiveVersion(id)[1].split('@')[1] : id.split('@')[1];
