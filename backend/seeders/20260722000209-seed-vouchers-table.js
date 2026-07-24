'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('vouchers', [
      {
        id: 'voucher-flavor10',
        code: 'FLAVOR10',
        title: 'Flavor 10',
        description: 'Customer voucher for 5 off orders above 15.',
        discount_type: 'fixed',
        discount_value: 5,
        min_subtotal: 15,
        max_discount: null,
        usage_limit: null,
        used_count: 0,
        starts_at: null,
        ends_at: null,
        active: true,
        restaurant_id: null,
        created_by: 'user-admin',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'voucher-feast25',
        code: 'FEAST25',
        title: 'Feast 25',
        description: 'Customer voucher for 25 percent off orders above 20.',
        discount_type: 'percentage',
        discount_value: 25,
        min_subtotal: 20,
        max_discount: 5,
        usage_limit: null,
        used_count: 0,
        starts_at: null,
        ends_at: null,
        active: true,
        restaurant_id: null,
        created_by: 'user-admin',
        created_at: now,
        updated_at: now,
      },
      {
        id: 'voucher-freedelivery',
        code: 'FREEDELIVERY',
        title: 'Free Delivery',
        description: 'Customer voucher that removes the delivery fee.',
        discount_type: 'free_delivery',
        discount_value: 0,
        min_subtotal: 0,
        max_discount: null,
        usage_limit: null,
        used_count: 0,
        starts_at: null,
        ends_at: null,
        active: true,
        restaurant_id: null,
        created_by: 'user-admin',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('vouchers', { id: ['voucher-flavor10', 'voucher-feast25', 'voucher-freedelivery'] }, {});
  },
};
