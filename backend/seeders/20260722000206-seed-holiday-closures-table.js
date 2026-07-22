'use strict';

const { holidayClosureRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = holidayClosureRows();
    if (rows.length) {
      await queryInterface.bulkInsert('holiday_closures', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('holiday_closures', null, {});
  },
};