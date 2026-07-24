module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('active', 'invited', 'suspended', 'disabled'), allowNull: false, defaultValue: 'active' },
    phone: { type: DataTypes.STRING, allowNull: false },
    avatar: { type: DataTypes.STRING, allowNull: false },
    avatarUrl: { type: DataTypes.TEXT, allowNull: true },
    restaurantId: { type: DataTypes.STRING, allowNull: true },
    shiftActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    loyaltyPoints: { type: DataTypes.INTEGER, allowNull: true },
  });

  User.associate = (models) => {
    User.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    User.hasMany(models.Address, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' });
    User.hasMany(models.RoleAssignment, { foreignKey: 'userId', as: 'roleAssignments', onDelete: 'CASCADE' });
    User.hasMany(models.NotificationRead, { foreignKey: 'userId', as: 'notificationReads', onDelete: 'CASCADE' });
    User.hasMany(models.Voucher, { foreignKey: 'createdBy', as: 'createdVouchers' });
  };

  return User;
};
