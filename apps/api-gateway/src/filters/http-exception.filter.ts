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
    // Handle standard JavaScript errors (including serialized microservice errors)
    else if (exception instanceof Error) {
      // NestJS TCP transport serializes microservice exceptions as JSON strings.
      // Try to extract the original statusCode/message before falling back to 500.
      try {
        const parsed = JSON.parse(exception.message);
        if (parsed && typeof parsed === 'object') {
          status = parsed.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
          const raw = parsed.message;
          message = Array.isArray(raw) ? raw.join(', ') : (raw || exception.message);
          errors = parsed.error ?? null;
        } else {
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = exception.message || 'An error occurred';
        }
      } catch {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.message || 'An error occurred';
      }
    }
    // Handle plain objects thrown by microservices (non-Error error values)
    else if (exception && typeof exception === 'object') {
      const err = exception as any;
      status = err.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const raw = err.message;
      message = Array.isArray(raw) ? raw.join(', ') : (raw || 'An error occurred');
      errors = err.error ?? null;
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
