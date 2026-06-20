import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    // Handle NestJS HttpExceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).error;
        // Handle validation errors from ValidationPipe
        if (Array.isArray(message)) {
          errors = message;
          message = 'Validation failed';
        }
      } else {
        message = exceptionResponse as string;
      }
    } 
    // Handle standard JavaScript errors
    else if (exception instanceof Error) {
      message = exception.message || 'An error occurred';
      status = HttpStatus.BAD_REQUEST;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errors && { errors }),
    };

    console.error('API Error:', errorResponse);
    response.status(status).json(errorResponse);
  }
}
