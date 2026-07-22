'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('branches', {
      id: { type: Sequelize.STRING, primaryKey: true },
      restaurant_id: { type: Sequelize.STRING, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      zone: { type: Sequelize.STRING, allowNull: false },
      lat: { type: Sequelize.DECIMAL(10, 7), allowNull: false },
      lng: { type: Sequelize.DECIMAL(10, 7), allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.ENUM('open', 'closed', 'paused', 'suspended'), allowNull: false, defaultValue: 'open' },
      average_prep_minutes: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 18 },
      minimum_order_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 150 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('branches');
  },
};