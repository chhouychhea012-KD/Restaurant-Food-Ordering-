'use strict';

const { roleRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = roleRows();
    if (rows.length) {
      await queryInterface.bulkInsert('roles', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};