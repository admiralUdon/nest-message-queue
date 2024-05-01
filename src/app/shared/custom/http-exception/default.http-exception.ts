import { HttpException, HttpStatus } from '@nestjs/common';
import { ISO8601DateTime } from 'app/core/utils/date.util';
 
/**
* TODO: Do documentation
*
* Note: Don't edit this file unless you know exactly what you are doing.
* We've put a strict structure on this code. Don't change it to type "any" just to make your
* part of coding works.
*/


export type DefaultHttpExceptionType = {
    statusCode?: HttpStatus;
    code?: string;
    message: string;
    error?: any;
    timestamp?: string;
    module?: string;
}

export class DefaultHttpException extends HttpException {

    readonly statusCode: HttpStatus;
    readonly code: string;
    readonly message: string;

    readonly error?: any;
    readonly timestamp?: string;
    readonly module?: string;
    
    constructor(stack: DefaultHttpExceptionType) {
        const timestamp = ISO8601DateTime(new Date());
        try {
            if (stack instanceof DefaultHttpException) {   
                const error = stack?.getResponse() as DefaultHttpExceptionType;
                const { module: moduleName, ...response } = error;
                const module = (process.env.ENABLE_DEBUGGING !== "true") ? undefined : moduleName; 
                super({...response, timestamp, module}, error.statusCode ?? 500);
            } else {                
                throw new Error(stack as any);
            }
        } catch(error) {            
            const { statusCode, code, message, module: moduleName } = stack;
            const module = (process.env.ENABLE_DEBUGGING !== "true") ? undefined : moduleName; 
            const response = {
                statusCode: statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
                code: code ?? "EE",
                message: message ?? (JSON.stringify(stack) !== "{}" ? JSON.stringify(stack) : stack.toString()),
                error: message === stack?.message ? ( stack?.error ?? {}) : stack,
                timestamp,
                module
            }            
            super(response, response.statusCode ?? 500);
        }
        
    }
}