module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.STRING, primaryKey: true },
    orderId: { type: DataTypes.STRING, allowNull: false },
    menuItemId: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    modifiers: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    note: { type: DataTypes.TEXT, allowNull: true },
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return OrderItem;
};
