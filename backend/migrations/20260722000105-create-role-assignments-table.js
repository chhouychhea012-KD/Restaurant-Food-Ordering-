'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_assignments', {
      id: { type: Sequelize.STRING, primaryKey: true },
      user_id: { type: Sequelize.STRING, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      role_id: { type: Sequelize.STRING, allowNull: true, references: { model: 'roles', key: 'id' }, onDelete: 'SET NULL' },
      role_name: { type: Sequelize.STRING, allowNull: false },
      restaurant_ids: { type: Sequelize.JSON, allowNull: false },
      branch_ids: { type: Sequelize.JSON, allowNull: false },
      access_window: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('role_assignments');
  },
};