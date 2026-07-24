module.exports = (sequelize, DataTypes) => {
  const Voucher = sequelize.define('Voucher', {
    id: { type: DataTypes.STRING, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    discountType: { type: DataTypes.ENUM('percentage', 'fixed', 'free_delivery'), allowNull: false },
    discountValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    minSubtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    maxDiscount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    usageLimit: { type: DataTypes.INTEGER, allowNull: true },
    usedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    startsAt: { type: DataTypes.DATE, allowNull: true },
    endsAt: { type: DataTypes.DATE, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    restaurantId: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.STRING, allowNull: true },
  });

  Voucher.associate = (models) => {
    Voucher.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    Voucher.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  };

  return Voucher;
};
