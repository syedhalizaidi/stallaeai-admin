import React from "react";
import { Trash2, Plus } from "lucide-react";
import styles from "./styles/MenuItemList.module.scss";
import Button from "../Button";
import buttonStyles from "./styles/Button.module.scss";
import fallback from "../../assets/FallBack_No Image.png"

const MenuItemList = ({ menuItems, onDeleteItem, onUpdateItem }) => {
  if (!menuItems || menuItems.length === 0) {
    return null;
  }

  // Group items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Sort categories alphabetically, but keep "Uncategorized" at the end
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  // Sort items within each category by name
  sortedCategories.forEach(category => {
    groupedItems[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  return (
    <div className={styles.menuItemsSection}>
      <h3 className={styles.menuItemsTitle}>Menu Items ({menuItems.length})</h3>

      {sortedCategories.map((category) => {
        const items = groupedItems[category];
        return (
          <div key={category} className={styles.categoryGroup}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryName}>{category}</span>
              <span className={styles.itemCount}>{items.length}</span>
            </div>

          <div className={styles.menuItemsList}>
            {items.map((item, index) => (
              <div key={item.id || index} className={styles.menuItem}>
                <div className={styles.menuItemCard}>
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={
                        item.images[0] instanceof File
                          ? URL.createObjectURL(item.images[0])
                          : item.images[0].image_url
                      }
                      alt="item-main-img"
                      className={styles.menuItemMainImage}
                    />
                  ) : (
                    <div className={styles.menuItemMainImagePlaceholder}>
                      <img src={fallback} alt="No Image found" />
                    </div>
                  )}
                  <div className={styles.menuItemInfo}>
                    <div className={styles.menuItemHeaderRow}>
                      <div className={styles.menuItemName}>{item.name}</div>
                      <div className={styles.menuItemPrice}>${item.price}</div>
                    </div>
                    {item.description && (
                      <div className={styles.menuItemDescription}>
                        {item.description}{" "}
                      </div>
                    )}
                    <div className={styles.menuItemDetailsRow}>
                      {item.prepTime && (
                        <span className={styles.menuItemPrepTime}>
                          {item.prepTime} min
                        </span>
                      )}
                      {item.images && item.images.length > 1 && (
                        <div className={styles.menuItemImagesList}>
                          {item.images.slice(1).map((img, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={
                                img instanceof File
                                  ? URL.createObjectURL(img)
                                  : img
                              }
                              alt={`item-img-thumb-${imgIdx}`}
                              className={styles.menuItemImageThumb}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.buttonGroup}>
                    <Button
                      onClick={() => onUpdateItem(item)}
                      size="small"
                      className={buttonStyles.updateButton}
                      title="Update item"
                    >
                      Update
                    </Button>
                    <Button
                      onClick={() => onDeleteItem(item.id)}
                      size="small"
                      icon={<Trash2 size={14} color="red" />}
                      className={buttonStyles.deleteButton}
                      title="Delete item"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default MenuItemList;
