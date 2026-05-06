import { Options } from "amqplib";

export const rabbitMQConfig = (): Options.Connect & { exchange: string; type: string; queueType: string; prefetch: number } => ({
    protocol: process.env.RABBITMQ_PROTOCOL || 'amqp',
    hostname: process.env.RABBITMQ_HOSTNAME,
    port: parseInt(process.env.RABBITMQ_PORT) || 5672,
    username: process.env.RABBITMQ_USERNAME,
    password: process.env.RABBITMQ_PASSWORD,
    vhost: process.env.RABBITMQ_VHOST || '/',
    exchange: process.env.RABBITMQ_EXCHANGE,
    type: process.env.RABBITMQ_TYPE,
    queueType: process.env.RABBITMQ_QUEUE_TYPE,
    prefetch: process.env.RABBITMQ_PREFETCH_COUNT ? parseInt(process.env.RABBITMQ_PREFETCH_COUNT, 10) : 10,
});
