'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('restaurants', {
      id: { type: Sequelize.STRING, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, allowNull: false, unique: true },
      cuisine: { type: Sequelize.JSON, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      rating: { type: Sequelize.DECIMAL(3, 2), allowNull: false, defaultValue: 4.5 },
      review_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      delivery_time: { type: Sequelize.STRING, allowNull: false },
      delivery_fee: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      hero_color: { type: Sequelize.STRING, allowNull: false },
      cover_image: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'open' },
      verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      partner_status: { type: Sequelize.ENUM('pending', 'verified', 'rejected', 'suspended'), allowNull: false, defaultValue: 'pending' },
      suspension_reason: { type: Sequelize.TEXT, allowNull: true },
      commission_rate: { type: Sequelize.DECIMAL(5, 4), allowNull: false, defaultValue: 0.18 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('restaurants');
  },
};