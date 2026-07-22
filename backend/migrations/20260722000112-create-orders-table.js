'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.STRING, primaryKey: true },
      customer_id: { type: Sequelize.STRING, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_id: { type: Sequelize.STRING, allowNull: false, references: { model: 'restaurants', key: 'id' }, onDelete: 'CASCADE' },
      restaurant_name: { type: Sequelize.STRING, allowNull: false },
      branch_id: { type: Sequelize.STRING, allowNull: true },
      branch_name: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false },
      estimated_delivery_at: { type: Sequelize.DATE, allowNull: false },
      delivery_address: { type: Sequelize.TEXT, allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      delivery_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      discount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      rider_name: { type: Sequelize.STRING, allowNull: true },
      payment_method: { type: Sequelize.STRING, allowNull: true },
      payment_summary: { type: Sequelize.STRING, allowNull: true },
      delivery_instructions: { type: Sequelize.TEXT, allowNull: true },
      voucher_code: { type: Sequelize.STRING, allowNull: true },
      loyalty_points_redeemed: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      refund_status: { type: Sequelize.ENUM('NONE', 'APPROVED'), allowNull: false, defaultValue: 'NONE' },
      refund_approved_at: { type: Sequelize.DATE, allowNull: true },
      refund_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};