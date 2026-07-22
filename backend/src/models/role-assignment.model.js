module.exports = (sequelize, DataTypes) => {
  const RoleAssignment = sequelize.define('RoleAssignment', {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
    roleId: { type: DataTypes.STRING, allowNull: true },
    roleName: { type: DataTypes.STRING, allowNull: false },
    restaurantIds: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    branchIds: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    accessWindow: { type: DataTypes.JSON, allowNull: true },
  });

  RoleAssignment.associate = (models) => {
    RoleAssignment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    RoleAssignment.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
  };

  return RoleAssignment;
};
