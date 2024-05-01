import { Module } from '@nestjs/common';
import { ServiceAModule } from 'app/core/services/service-a/service-a.module';
import { RabbitMQController } from 'app/modules/rabbitmq/rabbitmq.controller';

@Module({
  imports: [ServiceAModule],
  controllers: [RabbitMQController],
  providers: []
})
export class RabbitMQModule {}