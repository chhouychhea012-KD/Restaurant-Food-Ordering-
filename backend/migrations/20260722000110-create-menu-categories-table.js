'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_categories', {
      id: { type: Sequelize.STRING, primaryKey: true },
      restaurant_id: { type: Sequelize.STRING, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('menu_categories');
  },
};