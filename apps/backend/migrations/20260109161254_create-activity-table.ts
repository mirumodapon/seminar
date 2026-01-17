import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activity', (table) => {
    table.string('activityId', 50)
    table.string('name', 255).notNullable()
    table.text('description')
    table.string('ogImage', 255)
    table.boolean('active').defaultTo(true)

    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    table.timestamp('updatedAt').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'))
    table.timestamp('deletedAt').defaultTo(null)

    table.primary(['activityId'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('activity')
}
