import { Module } from "@nestjs/common";
import { RabbitMQService } from "app/core/providers/rabbitmq/rabbitmq.service";
import { LogServiceModule } from "../log/log.module";

@Module({
    imports: [LogServiceModule],
    providers: [RabbitMQService], 
    exports: [RabbitMQService]
})
export class RabbitMQServiceModule{}