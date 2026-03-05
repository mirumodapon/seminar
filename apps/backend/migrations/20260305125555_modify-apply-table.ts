import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('apply', (table) => {
    table.string('keywords', 255).nullable()
    table.string('email', 255).nullable()
    table.string('meal', 20).defaultTo('NORMAL')
    table.dropColumn('vegetables')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('apply', (table) => {
    table.dropColumn('keywords')
    table.dropColumn('email')
    table.dropColumn('meal')
    table.boolean('vegetables').defaultTo(false)
  })
}
