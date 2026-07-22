module.exports = (sequelize, DataTypes) => {
  const HolidayClosure = sequelize.define('HolidayClosure', {
    id: { type: DataTypes.STRING, primaryKey: true },
    branchId: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
  });

  HolidayClosure.associate = (models) => {
    HolidayClosure.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
  };

  return HolidayClosure;
};
