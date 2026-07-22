'use strict';

const { userRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = userRows();
    if (rows.length) {
      await queryInterface.bulkInsert('users', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};