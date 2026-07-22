'use strict';

const { menuCategoryRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = menuCategoryRows();
    if (rows.length) {
      await queryInterface.bulkInsert('menu_categories', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('menu_categories', null, {});
  },
};