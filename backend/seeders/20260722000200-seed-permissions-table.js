'use strict';

const { permissionRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = permissionRows();
    if (rows.length) {
      await queryInterface.bulkInsert('permissions', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};