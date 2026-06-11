import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, mergeMap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaAuditLoggerService } from './prisma-audit-logger.service';

type RequestLike = {
  method: string;
  path?: string;
  originalUrl?: string;
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    role?: string;
  };
  params?: Record<string, string>;
};

const AUDITED_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogger: PrismaAuditLoggerService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<RequestLike>();

    if (!this.shouldAudit(request)) {
      return next.handle();
    }

    const path = request.path ?? request.originalUrl ?? '';
    const entity = this.resolveEntity(path);
    const entityId = request.params?.id;
    const oldValue = entityId ? await this.findEntitySnapshot(entity, entityId) : null;

    return next.handle().pipe(
      mergeMap(async (newValue) => {
        await this.auditLogger.log({
          action: this.resolveAction(request.method, path),
          entity,
          entityId: this.resolveEntityId(entityId, newValue),
          userId: request.user!.id,
          beforeData: oldValue,
          afterData: newValue,
          oldValue,
          newValue,
          ipAddress: request.ip,
          userAgent: this.headerValue(request.headers['user-agent']),
        });

        return newValue;
      }),
    );
  }

  private shouldAudit(request: RequestLike): boolean {
    if (!AUDITED_METHODS.has(request.method) || !request.user?.id) {
      return false;
    }

    const path = request.path ?? request.originalUrl ?? '';
    return !path.includes('/audit-logs') && !path.includes('/notifications/');
  }

  private resolveAction(method: string, path: string): string {
    if (path.includes('/login')) return 'LOGIN';
    if (path.includes('/register')) return 'REGISTER';
    if (path.includes('/accept') || path.includes('/reject') || path.includes('/complete') || path.includes('/cancel')) {
      return 'STATUS_CHANGE';
    }
    if (method === 'POST') return 'CREATE';
    if (method === 'DELETE') return 'DELETE';
    return 'UPDATE';
  }

  private resolveEntity(path: string): string {
    const [segment = 'system'] = path.replace(/^\/?api\/?/, '').split('/').filter(Boolean);
    return segment
      .replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
      .replace(/^\w/, (letter) => letter.toUpperCase());
  }

  private async findEntitySnapshot(entity: string, id: string): Promise<unknown> {
    const model = this.modelForEntity(entity);
    if (!model) {
      return null;
    }

    return model.findUnique({ where: { id } });
  }

  private modelForEntity(entity: string): { findUnique(input: { where: { id: string } }): Promise<unknown> } | null {
    const prisma = this.prisma as unknown as Record<string, unknown>;
    const key = entity.charAt(0).toLowerCase() + entity.slice(1);
    const model = prisma[key];

    if (model && typeof model === 'object' && 'findUnique' in model) {
      return model as { findUnique(input: { where: { id: string } }): Promise<unknown> };
    }

    return null;
  }

  private resolveEntityId(paramId: string | undefined, value: unknown): string | undefined {
    if (paramId) {
      return paramId;
    }

    if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
      return value.id;
    }

    return undefined;
  }

  private headerValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value.join(', ') : value;
  }
}
