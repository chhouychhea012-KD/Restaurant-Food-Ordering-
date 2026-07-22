module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
    id: { type: DataTypes.STRING, primaryKey: true },
    restaurantId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    zone: { type: DataTypes.STRING, allowNull: false },
    lat: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    lng: { type: DataTypes.DECIMAL(10, 7), allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('open', 'closed', 'paused', 'suspended'), allowNull: false, defaultValue: 'open' },
    averagePrepMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 18 },
    minimumOrderAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 150 },
  });

  Branch.associate = (models) => {
    Branch.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    Branch.hasMany(models.BranchOperatingHour, { foreignKey: 'branchId', as: 'operatingHours', onDelete: 'CASCADE' });
    Branch.hasMany(models.HolidayClosure, { foreignKey: 'branchId', as: 'holidayClosures', onDelete: 'CASCADE' });
  };

  return Branch;
};
