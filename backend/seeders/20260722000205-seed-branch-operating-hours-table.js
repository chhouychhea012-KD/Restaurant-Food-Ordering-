'use strict';

const { branchOperatingHourRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = branchOperatingHourRows();
    if (rows.length) {
      await queryInterface.bulkInsert('branch_operating_hours', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('branch_operating_hours', null, {});
  },
};