'use strict';

const { roleAssignmentRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = roleAssignmentRows();
    if (rows.length) {
      await queryInterface.bulkInsert('role_assignments', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_assignments', null, {});
  },
};