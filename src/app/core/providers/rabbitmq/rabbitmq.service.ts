/**
 * 
 * Please update this so that we can track the latest version.
 * 
 * Author           : Afiq Ammar (afiqammar.azhar@teras.com.my)
 * Last Contributor : Ahmad Miqdaad (ahmadmiqdad.aziz@teras.com.my)
 * Last Updated     : 30 April 2024
 * 
 * **/

import { Injectable, Logger } from "@nestjs/common";
import * as amqp from 'amqplib';
import { rabbitMQConfig } from "app/config/rabbitmq.config";

@Injectable()
export class RabbitMQService {

    private config = rabbitMQConfig();
    private connection: amqp.Connection;
    private channel: amqp.Channel;
    private isConnected: boolean = false;

    private readonly logger = new Logger(RabbitMQService.name);

    /**
     * Constructor
     */
    constructor(
    ) {
        this.connect();
    }

    private async connect() {

        // Check if the RabbitMQ Connection Already Established
        if (this.isConnected) {
            this.logger.debug(`RabbitMQ Service Already Established : ${this.isConnected}`);
            return;
        }
        
        try {

            const url = `amqp://${this.config.user}:${encodeURIComponent(this.config.password)}@${this.config.url}:${this.config.port}/${this.config.vhost}`;
            this.logger.debug(`RabbitMQ Connection String : ${url}`);
            this.connection = await amqp.connect(url);

            //  Set isConnected to true
            this.isConnected = true;   

            this.connection.on('error', (err) => {
              this.handleError(err);
            });

            this.connection.on('close', (msg) => {
              this.handleClose(msg);
            });

            this.channel = await this.connection.createChannel();

            await this.channel.assertExchange(this.config.exchange, this.config.type, { durable: true });
            
          } catch (error) {
                this.handleError(error);
          }         
    }

    private async handleClose(msg) {
        this.logger.warn("RabbitMQ connection have been closed", msg);
        await this.channel.close();
        await this.connection.close();
    }

    private handleError(err) {
        this.logger.error("An error has occured", err);
        this.isConnected = false;
        setTimeout(() => this.connect(), 1000); // Attempt to reconnect after 1 second
    }

    async publish(message: {}, routingKey: string) {
        const messageObjStr = JSON.stringify(message);
        try {
            const publishMessage = await this.channel.publish(this.config.exchange, routingKey, Buffer.from(messageObjStr), {persistent: true});
            return { status: publishMessage };
        } catch (error) {            
            return { status: false, error: error };
        }
    }

    async consume(queue: string, callback: (message: any) => void): Promise<void> {
        await this.channel.assertQueue(queue);
        this.channel.consume(queue, (message) => {
          if (message !== null) {
            callback(JSON.parse(message.content.toString()));
            this.channel.ack(message);
          }
        });
    }
}

