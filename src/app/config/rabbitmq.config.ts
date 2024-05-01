export const rabbitMQConfig = () => ({
    url: process.env.RABBITMQ_URL,
    port: process.env.RABBITMQ_PORT,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
    vhost: process.env.RABBITMQ_VHOST,
    exchange: process.env.RABBITMQ_EXCHANGE,
    type: process.env.RABBITMQ_TYPE
});