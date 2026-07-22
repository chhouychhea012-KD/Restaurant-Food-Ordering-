'use strict';

const { menuItemRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = menuItemRows();
    if (rows.length) {
      await queryInterface.bulkInsert('menu_items', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('menu_items', null, {});
  },
};