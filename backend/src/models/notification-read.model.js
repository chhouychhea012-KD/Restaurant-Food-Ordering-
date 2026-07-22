module.exports = (sequelize, DataTypes) => {
  const NotificationRead = sequelize.define('NotificationRead', {
    notificationId: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING, primaryKey: true },
  });

  NotificationRead.associate = (models) => {
    NotificationRead.belongsTo(models.Notification, { foreignKey: 'notificationId', as: 'notification' });
    NotificationRead.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return NotificationRead;
};
