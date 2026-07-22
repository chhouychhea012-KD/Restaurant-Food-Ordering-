'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      role_id: { type: Sequelize.STRING, primaryKey: true, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE' },
      permission_key: { type: Sequelize.STRING, primaryKey: true, references: { model: 'permissions', key: 'key' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('role_permissions');
  },
};