/**
 * 
 * Please update this so that we can track the latest version.
 * 
 * Author           : Afiq Ammar (afiqammar.azhar[at]teras.com.my)
 * Last Contributor : Khairul Zamidi (zamidi.zakaria[at]teras.com.my)
 * Last Updated     : 14 February 2026
 * 
 * **/

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { rabbitMQConfig } from 'app/config/rabbitmq.config';
import { LogService } from '../log/log.service';

interface RabbitMQConnection {
    name: string;
    conn: amqp.Connection;
    channel: amqp.Channel;
    config: any;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(RabbitMQService.name);
    private readonly connections = new Map<string, RabbitMQConnection>();

    // State management for persistence
    private _reconnectTimers = new Map<string, NodeJS.Timeout>();
    private _cachedConfigs = new Map<string, any>();
    private _retryAttempts = new Map<string, number>();

    private consumers: {
        connectionName: string;
        queue: string;
        onMessage: (message: any) => Promise<void>;
    }[] = [];

    /**
     * Constructor
     */
    constructor(
        private readonly _logService: LogService,
    ) { }

    async onModuleInit() {
        // await this.connect();
        await this.connect('default', rabbitMQConfig());
    }

    async onModuleDestroy() {
        this.logger.log('Cleaning up RabbitMQ connections...');

        // Kill all pending reconnection timers
        for (const [name, timer] of this._reconnectTimers) {
            clearTimeout(timer);
            this.logger.debug(`Cleared reconnection timer for [${name}]`);
        }
        this._reconnectTimers.clear();

        // Gracefully close all connections
        for (const [name, entry] of this.connections) {
            try {
                if (entry.conn) await entry.conn.close();
                this.logger.debug(`Closed connection [${name}]`);
            } catch (error) {
                this.logger.error(`Error closing [${name}]: ${(error as Error).message}`);
            }
        }
        this.connections.clear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    async publish(
        message: {},
        routingKey: string,
        connectionName: string = 'default',
    ) {
        const connEntry = this.connections.get(connectionName) ?? this.connections.get('default');
        if (!connEntry || !connEntry.conn) return { status: false, error: 'No connection' };

        try {
            // Re-use or create the publishing channel
            if (!connEntry.channel) {
                connEntry.channel = await connEntry.conn.createChannel();
                connEntry.channel.on('error', (err) => {
                    this.logger.error(`Publish channel error: ${err.message}`);
                    connEntry.channel = null; // Force recreation on next publish
                });
            }

            const payload = Buffer.from(JSON.stringify(message));
            const status = connEntry.channel.publish(
                connEntry.config.exchange,
                routingKey,
                payload,
                { persistent: true }
            );
            return { status };
        } catch (err) {
            return { status: false, error: err };
        }
    }

    /**
     * Consumes messages from a RabbitMQ queue and processes them using the provided callback.
     * 
     * Strategy 1 : (LESS RECOMMENDED) 
     * Consumes messages from a RabbitMQ queue and processes them using the provided callback.
     * If processing fails, the message is negatively acknowledged, thread sleep 3s and requeued immediately.
     * No retry count, no dropping logic. Introduce Poison Pills(infinite error).
     * 
     * Strategy 2 : (RECOMMENDED) -- CURRENTLY IN USE (Modified to inifinte retry with delay, never drop)
     * Uses a per-queue retry pattern: failed messages go to a retry queue with TTL, 
     * then automatically return to the original queue via DLX for delayed retry.
     * 
     * @param queue - The name of the RabbitMQ queue to consume from.
     * @param onMessage - An async callback to handle the parsed message payload.
     */
    async consume(
        queue: string,
        onMessage: (message: any) => Promise<void>,
        connectionName: string = 'default'
    ): Promise<void> {

        if (!queue) {
            this._logService.warn(`Queue name not defined, skipping consume for connection "${connectionName}"`);
            return;
        }

        // Save the consumer intent so we can bind it once the connection is alive
        const exists = this.consumers.find(c => c.queue === queue && c.connectionName === connectionName);
        if (!exists) this.consumers.push({ queue, onMessage, connectionName });

        const connection = this.connections.get(connectionName);
        if (!connection || !connection.conn) {
            this.logger.warn(`[${connectionName}] Connection not ready. Queue "${queue}" will bind once connected.`);
            return;
        }

        try {
            const channel = await connection.conn.createChannel();

            // Handle channel errors so they don't crash the app
            channel.on('close', () => {
                this.logger.warn(`[${connectionName}] Channel for queue "${queue}" closed. Attempting to restart consumer...`);

                // Check if the connection is still alive before trying to restart
                const currentConn = this.connections.get(connectionName);
                if (currentConn && currentConn.conn) {
                    setTimeout(() => this.consume(queue, onMessage, connectionName), 60000);
                }
            });

            channel.on('error', (err) => {
                this.logger.error(`[${connectionName}] Channel error for ${queue}: ${err.message}`);
            });

            // Ready the queue
            await channel.prefetch(connection.config.prefetch ?? 10);
            const queueExchange = `${queue}.exchange`;
            await channel.assertExchange(queueExchange, 'direct', { durable: true });
            await channel.assertQueue(queue, {
                durable: true,
                arguments: { 'x-queue-type': connection.config.queueType },
            });
            await channel.bindQueue(queue, queueExchange, queue); // routing key = queue name

            // Retry setup
            const retryExchange = `${queue}.retry.exchange`;
            const retryQueue = `${queue}.retry.5m`;
            const retryTtlMs = 5 * 60 * 1000; // 5 minutes
            await channel.assertExchange(retryExchange, 'direct', { durable: true });
            await channel.assertQueue(retryQueue, {
                durable: true,
                arguments: {
                    'x-message-ttl': retryTtlMs,
                    'x-dead-letter-exchange': queueExchange,
                    'x-dead-letter-routing-key': queue,
                },
            });
            await channel.bindQueue(retryQueue, retryExchange, 'retry');

            // Consume
            channel.consume(queue, async (message) => {
                if (!message) return;

                const raw = message.content.toString();
                let payload: any;

                try {
                    payload = JSON.parse(raw);
                } catch (err) {
                    this._logService.warn('Invalid JSON:', { rawMessage: raw });
                    channel.ack(message); // Acknowledge the message without retrying since it's invalid
                    return;
                }

                try {
                    await onMessage(payload);
                    channel.ack(message);
                } catch (err) {
                    this._logService.warn('Processing error:', err);
                    // Strategy 1: Immediately requeue to the back (no delay)
                    // channel.sendToQueue(queue, message.content, {
                    //     persistent: true,
                    // });
                    // channel.ack(message); // Ack original so it's not redelivered

                    // Strategy 2: Use retry strategy. Set maxRetries as -1 so it become infinite loop retry
                    this.handleRetry(channel, message, retryExchange, -1);
                }
            });

            this.logger.debug(`[${connectionName}] Queue "${queue}" is ready and consuming.`);
        } catch (error) {
            this.logger.error(`Failed to setup consumer for ${queue}: ${(error as Error).message}`);
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private async connect(name: string, config: any) {
        // Save config for retry
        this._cachedConfigs.set(name, config);
        if (this.connections.has(name)) return;

        const { url, user, password, port, vhost } = config;
        if (!url) {
            this.logger.debug(`RabbitMQ [${name}] connection skipped: URL is not configured`);
            return;
        }

        try {
            const connStr = `amqps://${user}:${encodeURIComponent(password)}@${url}:${port}${vhost ? `/${vhost}` : ''}`;
            const safeConnStr = `amqps://${user}:<hidden>@${url}:${port}${vhost ? `/${vhost}` : ''}`;
            this.logger.log(`Connecting to RabbitMQ [${name}] at ${safeConnStr}`);

            const conn = await amqp.connect(connStr);

            // Clear the timer
            if (this._reconnectTimers.has(name)) {
                clearTimeout(this._reconnectTimers.get(name));
                this._reconnectTimers.delete(name);
            }

            conn.on('error', (err) => this.handleError(name, err));
            conn.on('close', (msg) => this.handleClose(name, msg));

            this._retryAttempts.delete(name);
            this.connections.set(name, { name, conn, channel: null, config });
            this.logger.debug(`RabbitMQ [${name}] ${safeConnStr} connected`);

            await this.rebindConsumers(name);
        } catch (error) {
            this.logger.error(`RabbitMQ [${name}] Connection Failed: ${(error as Error).message}`);
            this.handleError(name, error);
        }
    }

    private async handleRetry(
        channel: amqp.Channel,
        msg: amqp.ConsumeMessage,
        retryExchange: string,
        maxRetries = -1
    ) {
        const headers = msg.properties.headers || {};
        const retryCount = headers['x-retry'] || 0;

        if (maxRetries !== -1 && retryCount >= maxRetries) {
            this._logService.warn('Max retries reached. Dropping message.', JSON.parse(msg.content.toString()));
            channel.ack(msg);
            return;
        }

        // Ack original message so it's not redelivered
        channel.ack(msg);
        // Publish to retry exchange with incremented retry header
        channel.publish(retryExchange, 'retry', msg.content, {
            persistent: true,
            headers: { 'x-retry': retryCount + 1 },
        });

        this._logService.warn(`Message sent to retry queue [${retryExchange}] with retry #${retryCount + 1}`);
    }

    private handleError(name: string, err: any) {
        if (this._reconnectTimers.has(name)) return;

        // Increment retry count for logging
        const currentAttempt = (this._retryAttempts.get(name) || 0) + 1;
        this._retryAttempts.set(name, currentAttempt);

        this.logger.error(`[${name}] Connection failed (Attempt ${currentAttempt}). Error: ${err.message}`);
        this.logger.log(`[${name}] Next reconnection attempt in 1 minute...`);

        const timer = setTimeout(async () => {
            this._reconnectTimers.delete(name);

            // Check if config exists before trying
            const config = this._cachedConfigs.get(name);
            if (config) {
                await this.connect(name, config);
            } else {
                this.logger.error(`[${name}] Critical: No cached config found for reconnection.`);
            }
        }, 60000);

        this._reconnectTimers.set(name, timer);
    }

    private async handleClose(name: string, msg: any) {
        this.logger.warn(`[${name}] Connection closed. Cleaning up and retrying...`);
        this.connections.delete(name);
        this.handleError(name, msg);
    }

    private async rebindConsumers(name: string) {
        for (const c of this.consumers.filter(
            (x) => x.connectionName === name
        )) {
            this.logger.log(`[${name}] Rebinding consumer for queue: ${c.queue}`);
            await this.consume(c.queue, c.onMessage, name);
        }
    }
}
 