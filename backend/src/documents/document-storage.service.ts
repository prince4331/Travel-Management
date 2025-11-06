import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentStorageService {
  generateStorageKey(ownerType: string, ownerId: string, suggestedName?: string): string {
    const safeOwnerType = ownerType.toLowerCase();
    const safeOwnerId = ownerId.toString();
    const slug = suggestedName ? this.slugify(suggestedName) : 'document';
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = randomUUID();
    return `documents/${safeOwnerType}/${safeOwnerId}/${stamp}-${random}-${slug}`;
  }

  buildMetadata(additional: Record<string, unknown> | undefined): Record<string, unknown> {
    return {
      ...additional,
      generatedAt: new Date().toISOString(),
    };
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }
}

