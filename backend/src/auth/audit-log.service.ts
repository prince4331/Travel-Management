import { Injectable } from '@nestjs/common';

@Injectable()
export class AuditLogService {
  async log(action: string, userId?: number) {
    // In production, write to DB or external log system
    console.log(`[AUDIT] ${action} for user ${userId ?? 'N/A'} at ${new Date().toISOString()}`);
  }
}
