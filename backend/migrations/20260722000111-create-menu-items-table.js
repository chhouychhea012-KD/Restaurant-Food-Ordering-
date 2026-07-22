'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_items', {
      id: { type: Sequelize.STRING, primaryKey: true },
      category_id: { type: Sequelize.STRING, allowNull: false, references: { model: 'menu_categories', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      image: { type: Sequelize.TEXT, allowNull: false },
      available: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      prep_time: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 15 },
      modifiers: { type: Sequelize.JSON, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('menu_items');
  },
};