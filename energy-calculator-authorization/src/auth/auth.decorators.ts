import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { Request } from 'express';

export const PUBLIC_ROUTE = 'publicRoute';
export const Public = () => SetMetadata(PUBLIC_ROUTE, true);

export interface AuthRequest extends Request {
  currentUserId?: number;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number | undefined =>
    context.switchToHttp().getRequest<AuthRequest>().currentUserId,
);
