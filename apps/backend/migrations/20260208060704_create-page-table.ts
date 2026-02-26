import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('page', (table) => {
    table.string('pageId', 50).notNullable()
    table.string('activityId', 50).notNullable()
    table.string('title', 50).notNullable()
    table.string('description', 100).notNullable()
    table.text('content').notNullable()
    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    table.timestamp('updatedAt').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'))
    table.timestamp('deletedAt').defaultTo(null)

    table.primary(['pageId', 'activityId'])
    table.foreign('activityId').references('activityId').inTable('activity').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('page')
}
