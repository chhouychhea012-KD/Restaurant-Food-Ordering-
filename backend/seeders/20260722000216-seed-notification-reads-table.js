'use strict';

const { notificationReadRows } = require('../src/seed-data/fromFrontend');

module.exports = {
  async up(queryInterface) {
    const rows = notificationReadRows();
    if (rows.length) {
      await queryInterface.bulkInsert('notification_reads', rows);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('notification_reads', null, {});
  },
};