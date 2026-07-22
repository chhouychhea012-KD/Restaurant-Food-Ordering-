'use strict';

const { rolePermissionRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = rolePermissionRows();
    if (rows.length) {
      await queryInterface.bulkInsert('role_permissions', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role_permissions', null, {});
  },
};