'use strict';

const { notificationRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = notificationRows();
    if (rows.length) {
      await queryInterface.bulkInsert('notifications', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('notifications', null, {});
  },
};