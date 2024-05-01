import { Routes } from "@nestjs/core";
import { RabbitMQModule } from "app/modules/rabbitmq/rabbitmq.module";

export const appRoutes: Routes = [
    {
        path: 'api',
        children: [
            { path: 'rabbitmq', module: RabbitMQModule },
        ]
    }
]