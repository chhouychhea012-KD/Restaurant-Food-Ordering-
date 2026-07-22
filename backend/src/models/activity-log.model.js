module.exports = (sequelize, DataTypes) => {
  const ActivityLog = sequelize.define('ActivityLog', {
    id: { type: DataTypes.STRING, primaryKey: true },
    actorUserId: { type: DataTypes.STRING, allowNull: true },
    actorName: { type: DataTypes.STRING, allowNull: false },
    actorRole: { type: DataTypes.STRING, allowNull: false },
    restaurantId: { type: DataTypes.STRING, allowNull: true },
    restaurantName: { type: DataTypes.STRING, allowNull: true },
    orderId: { type: DataTypes.STRING, allowNull: true },
    domain: { type: DataTypes.STRING, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    metadata: { type: DataTypes.JSON, allowNull: true },
  });

  return ActivityLog;
};
