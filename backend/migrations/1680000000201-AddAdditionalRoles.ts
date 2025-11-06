import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdditionalRoles1680000000201 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT OR IGNORE INTO roles (name) VALUES ('co-admin'), ('guest');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM roles WHERE name IN ('co-admin', 'guest');
    `);
  }
}

