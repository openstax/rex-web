import config from '../../src/config';
import { assertDefined } from '../../src/app/utils';

export const RELEASE_ID = assertDefined(config.RELEASE_ID, 'REACT_APP_RELEASE_ID environment variable must be set');
export const BUCKET_NAME = process.env.BUCKET_NAME || 'sandbox-unified-web-primary';
export const BUCKET_REGION = process.env.BUCKET_REGION || 'us-east-1';
export const PUBLIC_URL = process.env.PUBLIC_URL || `/rex/releases/${RELEASE_ID}`;
export const WORK_REGION = process.env.WORK_REGION || 'us-east-2';
