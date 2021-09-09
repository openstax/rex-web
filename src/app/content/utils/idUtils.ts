export const stripArchiveVersion = (id: string): string => id.split('__')[1];
export const stripIdVersion = (id: string): string =>
    id.includes('__') ? stripArchiveVersion(id).split('@')[0] : id.split('@')[0];
export const getIdVersion = (id: string): string | undefined => id.split('@')[1];
