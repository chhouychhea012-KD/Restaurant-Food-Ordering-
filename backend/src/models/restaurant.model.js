module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    cuisine: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    description: { type: DataTypes.TEXT, allowNull: true },
    rating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 4.5 },
    reviewCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    deliveryTime: { type: DataTypes.STRING, allowNull: false },
    deliveryFee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    heroColor: { type: DataTypes.STRING, allowNull: false },
    coverImage: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'open' },
    verified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    partnerStatus: { type: DataTypes.ENUM('pending', 'verified', 'rejected', 'suspended'), allowNull: false, defaultValue: 'pending' },
    suspensionReason: { type: DataTypes.TEXT, allowNull: true },
    commissionRate: { type: DataTypes.DECIMAL(5, 4), allowNull: false, defaultValue: 0.18 },
  });

  Restaurant.associate = (models) => {
    Restaurant.hasMany(models.Branch, { foreignKey: 'restaurantId', as: 'branches', onDelete: 'CASCADE' });
    Restaurant.hasMany(models.MenuCategory, { foreignKey: 'restaurantId', as: 'menuCategories', onDelete: 'CASCADE' });
    Restaurant.hasMany(models.Order, { foreignKey: 'restaurantId', as: 'orders' });
    Restaurant.hasMany(models.User, { foreignKey: 'restaurantId', as: 'users' });
    Restaurant.hasMany(models.Voucher, { foreignKey: 'restaurantId', as: 'vouchers', onDelete: 'CASCADE' });
  };

  return Restaurant;
};
