import { ServerInfo } from './serverinfo';

declare global {
    namespace NodeJS {
        interface Global {
            optsYoutubeDL: string[],
            servers: Record<string, ServerInfo>
        }
    }
}
