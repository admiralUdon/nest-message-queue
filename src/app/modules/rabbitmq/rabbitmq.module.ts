import { Module } from '@nestjs/common';
import { LogServiceModule } from 'app/core/providers/log/log.module';
import { ServiceAModule } from 'app/core/services/service-a/service-a.module';
import { RabbitMQController } from 'app/modules/rabbitmq/rabbitmq.controller';

@Module({
  imports: [ServiceAModule, LogServiceModule],
  controllers: [RabbitMQController],
  providers: []
})
export class RabbitMQModule {}