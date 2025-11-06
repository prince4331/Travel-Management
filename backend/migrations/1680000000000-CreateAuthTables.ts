import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuthTables1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '20',
            isNullable: false,
            isUnique: true,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'photoUrl',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'bloodGroup',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'emergencyContact',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'role_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: 'FK_users_role_id',
            columnNames: ['role_id'],
            referencedTableName: 'roles',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'refreshToken',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: "CURRENT_TIMESTAMP",
          },
        ],
        foreignKeys: [
          {
            name: 'FK_sessions_user_id',
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sessions');
    await queryRunner.dropTable('users');
    await queryRunner.dropTable('roles');
  }
}
