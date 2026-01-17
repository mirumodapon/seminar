import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('page', (table) => {
    table.string('pageId', 50)
    table.string('activityId', 50).notNullable()

    table.text('content')
    table.string('title', 255)
    table.text('description')
    table.string('author', 255)
    table.boolean('draft').defaultTo(true)

    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    table.timestamp('updatedAt').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'))
    table.timestamp('deletedAt').defaultTo(null)

    table.primary(['pageId', 'activityId'])
    table.foreign('activityId').references('activityId').inTable('activity')
    table.index('activityId')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('page')
}
