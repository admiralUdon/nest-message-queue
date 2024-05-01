/**
 * 
 * Please update this so that we can track the latest version.
 * 
 * Author           : Ahmad Miqdaad (ahmadmiqdad.aziz@teras.com.my)
 * Last Contributor : Ahmad Miqdaad (ahmadmiqdad.aziz@teras.com.my)
 * Last Updated     : 30 April 2024
 * 
 * **/

import { Injectable, NestMiddleware } from '@nestjs/common';
import { LogService } from 'app/core/providers/log/log.service';
import { ISO8601WithMs } from 'app/core/utils/date.util';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {

    /**
     * Constructor
     */
    
    constructor(
        private _logService: LogService
    ) {
        this._logService.registerClassName(LogMiddleware.name);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Middleware
    // -----------------------------------------------------------------------------------------------------

    use(req: Request, res: Response, next: NextFunction) {

        // Get Request Start Timestamp
        const requestStartTime = new Date();

        // Extract client IP, request body, and response body
        const xForwardedForHeader = req.headers['x-forwarded-for'];
        const clientIP: string = Array.isArray(xForwardedForHeader)
            ? xForwardedForHeader[0]
            : xForwardedForHeader || req.ip;

        const requestBody = JSON.stringify(req.body);
        
        // Start YYYY-MM-DD HH:mm:ss-APP.log
        this._logService.transaction({
            type        : "start",
            data        : {
                timestamp   : ISO8601WithMs(requestStartTime),
                url         : req.originalUrl,
                ip          : clientIP, 
                requestBody
            }
        });

        // Capture the original response.send method to intercept the response body
        const originalSend = res.send.bind(res);
        let bufferedResponseBody = '';
        (res as any).send = function (body: any) {
            bufferedResponseBody = body;
            originalSend(body);
        };

        next();

        // Wait for the response to be sent before logging
        const loggingPromise = new Promise<void>((resolve, reject) => {
            res.once('finish', () => {                

                const requestEndTime = new Date();
                const responseTime = requestEndTime.getTime() - requestStartTime.getTime();

                // End YYYY-MM-DD HH:mm:ss-APP.log
                this._logService.transaction({ 
                    type        : "end",
                    data        : {
                        url         : req.originalUrl,
                        ip          : clientIP, 
                        timestamp   : ISO8601WithMs(requestEndTime),
                        responseBody: bufferedResponseBody,
                        responseTime,
                    }
                });
            });
        });

        // Ensure the logging has completed before moving on
        loggingPromise.catch((error) => {
            this._logService.error(`Error during logging: ${error.message}`);
        });
    }
}