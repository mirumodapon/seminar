import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('activity', (table) => {
    table.string('banner', 255)
    table.string('logo', 255)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('activity', (table) => {
    table.dropColumn('banner')
    table.dropColumn('logo')
  })
}
