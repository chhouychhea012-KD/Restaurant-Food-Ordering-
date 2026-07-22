module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    kind: { type: DataTypes.ENUM('order', 'promo', 'system', 'catalog', 'account'), allowNull: false },
    audienceRole: { type: DataTypes.ENUM('admin', 'customer'), allowNull: false },
    userId: { type: DataTypes.STRING, allowNull: true },
    ctaLabel: { type: DataTypes.STRING, allowNull: true },
    ctaTo: { type: DataTypes.STRING, allowNull: true },
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Notification.hasMany(models.NotificationRead, { foreignKey: 'notificationId', as: 'reads', onDelete: 'CASCADE' });
  };

  return Notification;
};
