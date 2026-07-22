'use strict';

const { addressRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = addressRows();
    if (rows.length) {
      await queryInterface.bulkInsert('addresses', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('addresses', null, {});
  },
};