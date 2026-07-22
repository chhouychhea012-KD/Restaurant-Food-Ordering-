'use strict';

const { activityLogRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = activityLogRows();
    if (rows.length) {
      await queryInterface.bulkInsert('activity_logs', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('activity_logs', null, {});
  },
};