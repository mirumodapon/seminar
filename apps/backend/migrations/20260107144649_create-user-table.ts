import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user', (table) => {
    table.increments('userId')
    table.string('email', 255).notNullable()
    table.string('name', 50)
    table.enum('role', ['user', 'admin'])
      .defaultTo('user')

    table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    table.timestamp('updatedAt').defaultTo(knex.raw('NULL ON UPDATE CURRENT_TIMESTAMP'))
    table.timestamp('deletedAt').defaultTo(null)

    table.unique(['email'])
    table.primary(['userId'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('user')
}
