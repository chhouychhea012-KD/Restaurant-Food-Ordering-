'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.STRING, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.ENUM('active', 'invited', 'suspended', 'disabled'), allowNull: false, defaultValue: 'active' },
      phone: { type: Sequelize.STRING, allowNull: false },
      avatar: { type: Sequelize.STRING, allowNull: false },
      avatar_url: { type: Sequelize.TEXT, allowNull: true },
      restaurant_id: { type: Sequelize.STRING, allowNull: true, references: { model: 'restaurants', key: 'id' }, onDelete: 'SET NULL' },
      shift_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      loyalty_points: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};