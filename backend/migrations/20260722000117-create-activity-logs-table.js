'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('activity_logs', {
      id: { type: Sequelize.STRING, primaryKey: true },
      actor_user_id: { type: Sequelize.STRING, allowNull: true },
      actor_name: { type: Sequelize.STRING, allowNull: false },
      actor_role: { type: Sequelize.STRING, allowNull: false },
      restaurant_id: { type: Sequelize.STRING, allowNull: true },
      restaurant_name: { type: Sequelize.STRING, allowNull: true },
      order_id: { type: Sequelize.STRING, allowNull: true },
      domain: { type: Sequelize.STRING, allowNull: false },
      action: { type: Sequelize.STRING, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      metadata: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('activity_logs');
  },
};