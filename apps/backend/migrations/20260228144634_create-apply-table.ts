import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('apply', (table) => {
    table.increments('applyId')
    table.string('activityId', 50).notNullable()
    table.integer('userId').unsigned().notNullable()
    table.string('topic', 255).notNullable()
    table.text('abstract').notNullable()
    table.string('school', 255).notNullable()
    table.string('department', 255).notNullable()
    table.string('status', 255).defaultTo('pending')
    table.boolean('accepted').defaultTo(false)
    table.boolean('attended').nullable()
    table.boolean('vegetables').defaultTo(false)
    table.text('diningHibits').nullable()
    table.string('slides', 255).nullable()
    table.string('poster', 255).nullable()

    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    table.timestamp('updatedAt').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'))

    table.foreign('activityId').references('activityId').inTable('activity').onDelete('CASCADE')
    table.foreign('userId').references('userId').inTable('user').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('apply')
}
