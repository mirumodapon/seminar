import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('page', (table) => {
    table.integer('order').unsigned().notNullable().defaultTo(0)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('page', (table) => {
    table.dropColumn('order')
  })
}
