'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_reads', {
      notification_id: { type: Sequelize.STRING, primaryKey: true, references: { model: 'notifications', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.STRING, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notification_reads');
  },
};