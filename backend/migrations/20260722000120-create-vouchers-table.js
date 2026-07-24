'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vouchers', {
      id: { type: Sequelize.STRING, primaryKey: true },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      discount_type: { type: Sequelize.ENUM('percentage', 'fixed', 'free_delivery'), allowNull: false },
      discount_value: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      min_subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      max_discount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      usage_limit: { type: Sequelize.INTEGER, allowNull: true },
      used_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      starts_at: { type: Sequelize.DATE, allowNull: true },
      ends_at: { type: Sequelize.DATE, allowNull: true },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      restaurant_id: { type: Sequelize.STRING, allowNull: true, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      created_by: { type: Sequelize.STRING, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vouchers');
  },
};
