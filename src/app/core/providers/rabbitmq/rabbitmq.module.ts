import { Module } from "@nestjs/common";
import { RabbitMQService } from "app/core/providers/rabbitmq/rabbitmq.service";

@Module({
    imports: [],
    providers: [RabbitMQService], 
    exports: [RabbitMQService]
})
export class RabbitMQServiceModule{}