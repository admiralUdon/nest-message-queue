/**
 * 
 * Please update this so that we can track the latest version.
 * 
 * Author           : Ahmad Miqdaad (ahmadmiqdad.aziz[at]teras.com.my)
 * Last Contributor : Ahmad Miqdaad (ahmadmiqdad.aziz[at]teras.com.my)
 * Last Updated     : 1 May 2024
 * 
 * **/

import { Injectable, Logger, Scope } from '@nestjs/common';
import { ISO8601Date } from 'app/core/utils/date.util';
import { convertSizeToBytes } from 'app/core/utils/size-conversion.util';
import { join, resolve } from 'path';
import * as winston from 'winston';

interface TransactionI {
    type            : "start" | "end";
    data            : {
        timestamp       : string;
        url?            : string;
        ip?             : string;
        requestBody?    : string;
        responseBody?   : string;
        responseTime?   : number;
    }
}

@Injectable({
    scope: Scope.TRANSIENT
})
export class LogService extends Logger {
    
    private readonly folderPath = resolve(process.env.FILE_LOG_PATH ?? "./src/storage/logs");

    constructor(
        private _winstonLogger: winston.Logger,
    ) {

        super();

        try {

            const todayDate = new Date();
            const fileName = `${ISO8601Date(todayDate)}-APP.log`;
            const maxSizeBytes = convertSizeToBytes(1, "GB");

            // Create a custom format
            const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
                const { type, data } = metadata;
                const { url, ip, timestamp: trxTimestamp, requestBody, responseBody, responseTime } = data ?? {};
                const datetime = trxTimestamp ?? timestamp;
                if(type === "start") {
                    return `[${datetime}] - START - ${ip} - ${url} - Request Body : ${requestBody}`
                }
                if(type === "end") {
                    return `[${datetime}] - END - Response Body : ${responseBody} -  Response Time: ${responseTime}ms`
                }
                const formattedMetadata = Object.keys(metadata).length ? ` ${JSON.stringify(metadata)}` : '';
                return `[${datetime}] - ${level.toUpperCase()} - Message: ${message} - Additional Data: ${formattedMetadata}`;
            });

            // Write logs
            this._winstonLogger = winston.createLogger({
                level: 'debug', // Default level
                format: winston.format.combine(
                    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), // Add timestamp
                    customFormat
                ),
                transports: [
                    new winston.transports.File({ 
                        filename    : join(this.folderPath, fileName),
                        maxsize     : maxSizeBytes
                    })
                ],
            });
            
        } catch(error) {
            throw new Error(error);
        }
    }

    registerClassName(moduleName: string) {
        this.context = moduleName;
    }

    transaction(params: TransactionI) {
        const { type, data } = params;
        this._winstonLogger.info(null, { type, data })
    }

    log(message: string, optionalParams?: any) {
        if (optionalParams === undefined) {
            super.log(message);
        } else {
            optionalParams = typeof optionalParams === 'string' ? { message, optionalParams } : { optionalParams };
            super.log(message, optionalParams);
        }

        this._winstonLogger.info(message, optionalParams);
    }

    error(message: string, trace?: string) {
        super.error(message, trace);
        this._winstonLogger.error(message, { trace });
    }

    warn(message: string, optionalParams?: any) {
        if (optionalParams === undefined) {
            super.warn(message);
        } else {
            optionalParams = typeof optionalParams === 'string' ? { message, optionalParams } : { optionalParams };
            super.warn(message, optionalParams);
        }
        this._winstonLogger.warn(message, optionalParams);
    }

    debug(message: string, optionalParams?: any) {                
        if (optionalParams === undefined) {
            super.debug(message);
        } else {
            optionalParams = typeof optionalParams === 'string' ? { message, optionalParams } : { optionalParams };
            super.debug(message, optionalParams);
        }
        this._winstonLogger.debug(message, optionalParams);
    }

    verbose(message: string, optionalParams?: any) {
        if (optionalParams === undefined) {
            super.verbose(message);
        } else {
            optionalParams = typeof optionalParams === 'string' ? { message, optionalParams } : { optionalParams };
            super.verbose(message, optionalParams);
        }
        this._winstonLogger.verbose(message, optionalParams);
    }

}
