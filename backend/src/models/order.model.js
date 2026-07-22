module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.STRING, primaryKey: true },
    customerId: { type: DataTypes.STRING, allowNull: false },
    restaurantId: { type: DataTypes.STRING, allowNull: false },
    restaurantName: { type: DataTypes.STRING, allowNull: false },
    branchId: { type: DataTypes.STRING, allowNull: true },
    branchName: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false },
    estimatedDeliveryAt: { type: DataTypes.DATE, allowNull: false },
    deliveryAddress: { type: DataTypes.TEXT, allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    deliveryFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    riderName: { type: DataTypes.STRING, allowNull: true },
    paymentMethod: { type: DataTypes.STRING, allowNull: true },
    paymentSummary: { type: DataTypes.STRING, allowNull: true },
    deliveryInstructions: { type: DataTypes.TEXT, allowNull: true },
    voucherCode: { type: DataTypes.STRING, allowNull: true },
    loyaltyPointsRedeemed: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    refundStatus: { type: DataTypes.ENUM('NONE', 'APPROVED'), allowNull: false, defaultValue: 'NONE' },
    refundApprovedAt: { type: DataTypes.DATE, allowNull: true },
    refundReason: { type: DataTypes.TEXT, allowNull: true },
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'customerId', as: 'customer' });
    Order.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
    Order.hasMany(models.OrderTimeline, { foreignKey: 'orderId', as: 'timeline', onDelete: 'CASCADE' });
  };

  return Order;
};
