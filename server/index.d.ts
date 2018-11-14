import { Server } from 'http';

interface Options {
  fallback404: boolean;
}

declare function startServer(options: Options): Promise<{server: Server, port: number}> ;
export default startServer;
