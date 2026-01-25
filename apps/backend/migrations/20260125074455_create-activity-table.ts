import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activity', (table) => {
    table.string('activityId', 50)
    table.string('name', 64).notNullable()
    table.text('description')
    table.string('ogImage', 32)
    table.string('banner', 32)

    table.boolean('active').defaultTo(false)

    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    table.timestamp('updatedAt').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'))
    table.timestamp('deletedAt').defaultTo(null)

    table.primary(['activityId'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('activity')
}
