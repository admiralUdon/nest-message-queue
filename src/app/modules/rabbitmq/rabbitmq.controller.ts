import { Controller, Get, HttpStatus, InternalServerErrorException, Query, Request, Response } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { LogService } from 'app/core/providers/log/log.service';
import { ServiceA } from 'app/core/services/service-a/service-a.service';
import { AppCode } from 'app/core/types/app.type';
import { DefaultHttpException } from 'app/shared/custom/http-exception/default.http-exception';
import { DefaultHttpResponse } from 'app/shared/custom/http-response/default.http-response';


@Controller()
export class RabbitMQController {

    /**
     * Constructor
     */

    constructor(
        private _serviceA: ServiceA,
        private _logService: LogService
    ){
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    @Get()
    @ApiOperation({ summary: "Display Demo", description: "A simple greeting API that returns a friendly \"Hello, World!\" message when accessed. It serves as a basic example or placeholder for API testing and demonstration purposes" })
    async getHello(
        @Request() request,
        @Response() response,
    ) {

        try {

            const message = "hello world";
            this._logService.debug("Publish message to RabbitMQ", { id: "service-a-rmq-demo", message});
            const rmqResult = await this._serviceA.publishRMQ({ message });
    
            const successCode = AppCode.OK;
            const result = new DefaultHttpResponse({
                code: successCode.code,
                message: successCode.description,
                statusCode: successCode.status,
                data: {
                    rmqResult
                }
            });
            
            response.status(result.statusCode);
            response.json(result);
            return response;
            
        } catch (error) {
            throw new DefaultHttpException(error);
        }
        
    }

}
