'use strict';

const { orderRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = orderRows();
    if (rows.length) {
      await queryInterface.bulkInsert('orders', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('orders', null, {});
  },
};