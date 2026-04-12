import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('activityApplySchedule', (table) => {
    table.string('activityId', 50).primary()
    table.timestamp('applyCreateDeadlineAt').nullable()
    table.timestamp('applyEditDeadlineAt').nullable()
    table.timestamp('slidesUploadDeadlineAt').nullable()
    table.timestamp('posterUploadDeadlineAt').nullable()

    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    table.timestamp('updatedAt').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'))

    table.foreign('activityId').references('activityId').inTable('activity').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('activityApplySchedule')
}
