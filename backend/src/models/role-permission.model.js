module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    roleId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    permissionKey: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
  });

  return RolePermission;
};
