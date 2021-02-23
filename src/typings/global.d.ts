import { ServerInfo } from './serverinfo';

declare global {
    namespace NodeJS {
        interface Global {
            servers: Record<string, ServerInfo>
        }
    }
}
