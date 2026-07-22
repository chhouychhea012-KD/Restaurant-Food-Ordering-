'use strict';

const { analyticsSnapshotRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = analyticsSnapshotRows();
    if (rows.length) {
      await queryInterface.bulkInsert('analytics_snapshots', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('analytics_snapshots', null, {});
  },
};