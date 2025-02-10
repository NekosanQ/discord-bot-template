import { logger } from '../utils/log';
import { EventBase } from './base/event_base';
import { client } from '..';
import { commandHandler } from '..';
/**
 * クライアントが準備完了したときに実行されるイベント
 */
class ReadyEvent extends EventBase<'ready'> {
    readonly eventName = 'ready' as const;

    async listener() {
        setInterval(() => {
            client.user?.setActivity({
                name: `${client.ws.ping}ms`,
            });
        }, 10000);
        commandHandler.registerCommands();
        logger.info(`[INFO] 起動完了: ${client.user?.tag}`);
    };
}

export default new ReadyEvent();
