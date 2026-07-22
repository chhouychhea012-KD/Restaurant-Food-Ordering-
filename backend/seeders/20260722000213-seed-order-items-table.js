'use strict';

const { orderItemRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = orderItemRows();
    if (rows.length) {
      await queryInterface.bulkInsert('order_items', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('order_items', null, {});
  },
};