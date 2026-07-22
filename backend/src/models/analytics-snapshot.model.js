module.exports = (sequelize, DataTypes) => {
  const AnalyticsSnapshot = sequelize.define('AnalyticsSnapshot', {
    id: { type: DataTypes.STRING, primaryKey: true },
    payload: { type: DataTypes.JSON, allowNull: false },
  });

  return AnalyticsSnapshot;
};
