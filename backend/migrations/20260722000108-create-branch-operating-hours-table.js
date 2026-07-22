'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('branch_operating_hours', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      branch_id: { type: Sequelize.STRING, allowNull: false, references: { model: 'branches', key: 'id' }, onDelete: 'CASCADE' },
      day: { type: Sequelize.INTEGER, allowNull: false },
      label: { type: Sequelize.STRING, allowNull: false },
      open: { type: Sequelize.STRING, allowNull: false },
      close: { type: Sequelize.STRING, allowNull: false },
      closed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('branch_operating_hours');
  },
};