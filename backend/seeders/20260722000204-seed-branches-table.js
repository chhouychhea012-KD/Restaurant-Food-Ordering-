'use strict';

const { branchRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = branchRows();
    if (rows.length) {
      await queryInterface.bulkInsert('branches', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('branches', null, {});
  },
};