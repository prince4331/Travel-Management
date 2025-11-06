import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoles1680000000100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (name) VALUES ('admin'), ('member'), ('super_admin');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM roles WHERE name IN ('admin', 'member', 'super_admin');
    `);
  }
}
