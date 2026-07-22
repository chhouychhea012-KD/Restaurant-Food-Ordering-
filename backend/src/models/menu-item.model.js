module.exports = (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: { type: DataTypes.STRING, primaryKey: true },
    categoryId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    image: { type: DataTypes.TEXT, allowNull: false },
    available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    prepTime: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
    modifiers: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  });

  MenuItem.associate = (models) => {
    MenuItem.belongsTo(models.MenuCategory, { foreignKey: 'categoryId', as: 'category' });
  };

  return MenuItem;
};
