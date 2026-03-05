import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('apply', (table) => {
    table.dropColumn('school')
    table.dropColumn('department')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('apply', (table) => {
    table.string('school', 255).nullable()
    table.string('department', 255).nullable()
  })
}
