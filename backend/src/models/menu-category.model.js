module.exports = (sequelize, DataTypes) => {
  const MenuCategory = sequelize.define('MenuCategory', {
    id: { type: DataTypes.STRING, primaryKey: true },
    restaurantId: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
  });

  MenuCategory.associate = (models) => {
    MenuCategory.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });
    MenuCategory.hasMany(models.MenuItem, { foreignKey: 'categoryId', as: 'items', onDelete: 'CASCADE' });
  };

  return MenuCategory;
};
