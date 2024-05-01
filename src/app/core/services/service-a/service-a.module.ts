import { Module } from "@nestjs/common";
import { ServiceA } from "app/core/services/service-a/service-a.service";
import { LogServiceModule } from "app/core/providers/log/log.module";
import { RabbitMQServiceModule } from "app/core/providers/rabbitmq/rabbitmq.module";

@Module({
    imports: [RabbitMQServiceModule, LogServiceModule],
    providers: [ServiceA], 
    exports: [ServiceA]
})
export class ServiceAModule{}