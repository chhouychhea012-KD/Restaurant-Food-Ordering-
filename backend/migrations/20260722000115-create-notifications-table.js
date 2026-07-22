'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.STRING, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      kind: { type: Sequelize.ENUM('order', 'promo', 'system', 'catalog', 'account'), allowNull: false },
      audience_role: { type: Sequelize.ENUM('admin', 'customer'), allowNull: false },
      user_id: { type: Sequelize.STRING, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      cta_label: { type: Sequelize.STRING, allowNull: true },
      cta_to: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notifications');
  },
};