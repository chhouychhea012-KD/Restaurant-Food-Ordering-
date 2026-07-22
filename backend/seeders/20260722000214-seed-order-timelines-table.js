'use strict';

const { orderTimelineRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = orderTimelineRows();
    if (rows.length) {
      await queryInterface.bulkInsert('order_timelines', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('order_timelines', null, {});
  },
};