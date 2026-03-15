import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('apply', (table) => {
    table.integer('attendCount').nullable()
    table.integer('mealNormal').nullable()
    table.integer('mealLactoOvo').nullable()
    table.integer('mealVegan').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('apply', (table) => {
    table.dropColumn('attendCount')
    table.dropColumn('mealNormal')
    table.dropColumn('mealLactoOvo')
    table.dropColumn('mealVegan')
  })
}

