import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

const MUTATING = ['POST', 'PUT', 'PATCH', 'DELETE'];
const SENSITIVE = new Set(['password', 'token', 'access_token', 'refresh_token']);

/** Strip sensitive keys and trim large payloads before persisting. */
function sanitize(value: any): any {
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, any> = {};
  let keys = 0;
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE.has(k)) continue;
    if (keys++ > 30) break;
    out[k] = v && typeof v === 'object' ? '[object]' : v;
  }
  return out;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method;

    return next.handle().pipe(
      tap((body) => {
        if (!MUTATING.includes(method)) return;
        const user = req.user;
        if (!user?.id) return; // skip unauthenticated (e.g. login)

        const path: string = req.route?.path || req.path || '';
        const segments = (req.originalUrl || path).split('?')[0].split('/').filter(Boolean);
        const entityType = segments[0] || 'unknown';
        const action = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
        const entityId = (body && typeof body === 'object' && body.id) || req.params?.id || null;

        // fire-and-forget; never block or fail the request
        this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action,
            entityType,
            entityId: entityId ? String(entityId) : null,
            newValues: method !== 'DELETE' ? sanitize(body) : undefined,
            ipAddress: (req.headers['x-forwarded-for'] || req.ip || '').toString().slice(0, 60),
            userAgent: (req.headers['user-agent'] || '').toString().slice(0, 250),
          },
        }).catch(() => { /* audit must never break the app */ });
      }),
    );
  }
}
