import { downloadOptions } from 'ytdl-core';
import { ServerInfo } from './serverinfo';

declare global {
  namespace NodeJS {
    interface Global {
      optsYTDL: downloadOptions,
      optsYoutubeDL: string[],
      servers: Record<string, ServerInfo>
    }
  }
}
