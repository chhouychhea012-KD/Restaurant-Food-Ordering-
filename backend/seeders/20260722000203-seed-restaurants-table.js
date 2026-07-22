'use strict';

const { restaurantRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = restaurantRows();
    if (rows.length) {
      await queryInterface.bulkInsert('restaurants', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('restaurants', null, {});
  },
};