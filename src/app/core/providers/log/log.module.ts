import { Module } from '@nestjs/common';
import { LogService } from 'app/core/providers/log/log.service';

@Module({
    providers: [LogService],
    exports: [LogService]
})
export class LogServiceModule {}