import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTourTypeAndFinancialPrivacy1680000000203 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'groups',
      new TableColumn({
        name: 'tourType',
        type: 'varchar',
        length: '20',
        default: "'friendly'",
      }),
    );

    await queryRunner.addColumn(
      'groups',
      new TableColumn({
        name: 'showFinancialDetailsToMembers',
        type: 'boolean',
        default: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('groups', 'showFinancialDetailsToMembers');
    await queryRunner.dropColumn('groups', 'tourType');
  }
}
