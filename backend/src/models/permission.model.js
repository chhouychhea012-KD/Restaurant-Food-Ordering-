module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    key: { type: DataTypes.STRING, primaryKey: true },
  });

  Permission.associate = (models) => {
    Permission.hasMany(models.RolePermission, { foreignKey: 'permissionKey', as: 'rolePermissions', onDelete: 'CASCADE' });
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      foreignKey: 'permissionKey',
      otherKey: 'roleId',
      as: 'roles',
    });
  };

  return Permission;
};
