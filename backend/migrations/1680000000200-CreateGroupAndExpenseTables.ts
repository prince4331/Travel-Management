import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateGroupAndExpenseTables1680000000200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'groups',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '150',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'destination',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'startDate',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'endDate',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'isPublic',
            type: 'boolean',
            default: 0,
          },
          {
            name: 'inviteCode',
            type: 'varchar',
            length: '16',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'coverImage',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'guides',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'group_members',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'group_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'member'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'pending'",
          },
          {
            name: 'displayName',
            type: 'varchar',
            length: '120',
            isNullable: true,
          },
          {
            name: 'emergencyContact',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'joinedAt',
            type: 'datetime',
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('group_members', [
      new TableForeignKey({
        columnNames: ['group_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'group_invites',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'group_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '16',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'expiresAt',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'usageLimit',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'usedCount',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'createdById',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('group_invites', [
      new TableForeignKey({
        columnNames: ['group_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['createdById'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'expenses',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'group_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '40',
            isNullable: false,
            default: "'other'",
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '8',
            isNullable: false,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'splits',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'paid_by_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'incurredOn',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: 'attachments',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('expenses', [
      new TableForeignKey({
        columnNames: ['group_id'],
        referencedTableName: 'groups',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['paid_by_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('expenses');
    await queryRunner.dropTable('group_invites');
    await queryRunner.dropTable('group_members');
    await queryRunner.dropTable('groups');
  }
}

