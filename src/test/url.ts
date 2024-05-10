import { PORT } from '../config';

const url = (path: string) => `http://localhost:${PORT}/${path.replace(/^\/+/, '')}`;

export default url;
