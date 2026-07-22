module.exports = (sequelize, DataTypes) => {
  const OrderTimeline = sequelize.define('OrderTimeline', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    label: { type: DataTypes.STRING, allowNull: false },
    time: { type: DataTypes.STRING, allowNull: false },
  });

  OrderTimeline.associate = (models) => {
    OrderTimeline.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return OrderTimeline;
};
