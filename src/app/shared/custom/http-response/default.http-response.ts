import { HttpStatus, Injectable } from '@nestjs/common';
import { ISO8601DateTime } from 'app/core/utils/date.util';

/**
* TODO: Do documentation
*
* Note: Don't edit this file unless you know exactly what you are doing.
* We've put a strict structure on this code. Don't change it to type "any" just to make your
* part of coding works.
*/

export class DefaultHttpResponseType<T = any> {
    code: string;
    message: string;
    statusCode: number;
    module?: string;
    additionalMessage?: any;
    data?: T;
    pagination?: Pagination
}

export interface Pagination {
    length: number;
    pageSize: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

@Injectable()
export class DefaultHttpResponse<T> {
    private readonly message: string;
    readonly statusCode: HttpStatus;
    private readonly timestamp: string;
    private readonly module: string;
    private readonly code: string;
    private readonly additionalMessage: any;
    private readonly error: string;
    private readonly data: T;
    private readonly pagination: Pagination;
 
    constructor(
        { message, statusCode, module, code, additionalMessage, data, pagination } : DefaultHttpResponseType,
    ) {
        this.message = message;
        this.timestamp = ISO8601DateTime(new Date());
        this.statusCode = statusCode;
        this.module = module;
        this.code = code;
        this.additionalMessage = additionalMessage;
        this.data = data;
        this.pagination = pagination;
    }
}