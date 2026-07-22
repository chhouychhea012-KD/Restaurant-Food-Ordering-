module.exports = (sequelize, DataTypes) => {
  const BranchOperatingHour = sequelize.define('BranchOperatingHour', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    branchId: { type: DataTypes.STRING, allowNull: false },
    day: { type: DataTypes.INTEGER, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    open: { type: DataTypes.STRING, allowNull: false },
    close: { type: DataTypes.STRING, allowNull: false },
    closed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  });

  BranchOperatingHour.associate = (models) => {
    BranchOperatingHour.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });
  };

  return BranchOperatingHour;
};
