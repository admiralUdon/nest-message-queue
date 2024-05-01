
import { Injectable } from "@nestjs/common";
import { LogService } from "app/core/providers/log/log.service";
import { RabbitMQService } from "app/core/providers/rabbitmq/rabbitmq.service";

@Injectable()
export class ServiceA {
    
    constructor (
        private _rabbitMQService: RabbitMQService,
        private _logService: LogService
    ){
        this._logService.registerClassName(ServiceA.name);
    }

    async publishRMQ(message): Promise<any | null> {
        try {
            this._logService.debug("Publish message to RabbitMQ", { message, id: "service-a-rmq-demo"});
            this._rabbitMQService.publish(message, "service-a-rmq-demo");
            return true;
        } catch (error) {        
            this._logService.error("An error has occured", error);
            throw new Error(error);
        }
    }
}