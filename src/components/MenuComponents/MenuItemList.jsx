import React, { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import styles from "./styles/MenuItemList.module.scss";
import Button from "../Button";
import buttonStyles from "./styles/Button.module.scss";
import fallback from "../../assets/FallBack_No Image.png";
import BulkDeleteModal from "../RestaurantSetup/BulkDeleteModal";

const MenuItemList = ({ menuItems, onDeleteItem, onUpdateItem, onBulkDelete }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState([]);

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

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === "Uncategorized") return 1;
    if (b === "Uncategorized") return -1;
    return a.localeCompare(b);
  });

  sortedCategories.forEach(category => {
    groupedItems[category].sort((a, b) => a.name.localeCompare(b.name));
  });

  // --- Helpers ---

  const toggleDescription = (itemId) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const formatDescription = (description) => {
    if (!description) return null;

    const lines = description.split('\n');
    const isStructured = lines.some(line => /^[A-Za-z\s#()]+:/.test(line));

    if (!isStructured) {
      return <p style={{ margin: 0 }}>{description}</p>;
    }

    return (
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {lines.map((line, index) => {
          const parts = line.split(/:(.*)/);
          if (parts.length >= 2 && parts[0].trim() !== "") {
            const label = parts[0].trim();
            const value = parts[1].trim();

            const isHighPriority = ["VIN", "Exterior Color", "Interior Color", "Transmission", "Mileage (km)"].includes(label);

            return (
              <div key={index} style={{ fontSize: '12px', display: 'flex', flexWrap: 'wrap' }}>
                <span style={{
                  fontWeight: 'bold',
                  marginRight: '8px',
                  color: isHighPriority ? 'var(--accent-primary, #2563EB)' : 'inherit'
                }}>
                  {label}:
                </span>
                <span style={{ color: '#6B7280' }}>{value}</span>
              </div>
            );
          }

          return (
            <p key={index} style={{
              fontSize: '12px',
              fontWeight: '600',
              marginTop: '8px',
              borderBottom: '1px solid #E5E7EB',
              paddingBottom: '4px',
              marginBottom: '4px'
            }}>
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  // --- Selection handlers ---

  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (category) => {
    const categoryItems = groupedItems[category];
    const categoryItemIds = categoryItems.map(item => item.id);
    const allSelected = categoryItemIds.every(id => selectedItems.has(id));

    const newSelected = new Set(selectedItems);
    if (allSelected) {
      categoryItemIds.forEach(id => newSelected.delete(id));
    } else {
      categoryItemIds.forEach(id => newSelected.add(id));
    }
    setSelectedItems(newSelected);
  };

  const isCategoryFullySelected = (category) => {
    const categoryItems = groupedItems[category];
    return categoryItems.every(item => selectedItems.has(item.id));
  };

  const isCategoryPartiallySelected = (category) => {
    const categoryItems = groupedItems[category];
    const selectedCount = categoryItems.filter(item => selectedItems.has(item.id)).length;
    return selectedCount > 0 && selectedCount < categoryItems.length;
  };

  const handleBulkDelete = () => {
    setBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    const idsToDelete = Array.from(selectedItems);
    if (onBulkDelete) {
      await onBulkDelete(idsToDelete);
    }
    setSelectedItems(new Set());
    setBulkDeleteModal(false);
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteModal(false);
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  return (
    <div className={styles.menuItemsSection}>
      <h3 className={styles.menuItemsTitle}>Menu Items ({menuItems.length})</h3>

      {/* Bulk Action Toolbar */}
      {selectedItems.size > 0 && (
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1E3A8A' }}>
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleClearSelection}
              style={{
                fontSize: '14px',
                color: '#2563EB',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Clear selection
            </button>
          </div>
          <button
            onClick={handleBulkDelete}
            style={{
              padding: '8px 16px',
              backgroundColor: '#DC2626',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}
          >
            <Trash2 size={16} />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {sortedCategories.map((category) => {
        const items = groupedItems[category];
        const isFullySelected = isCategoryFullySelected(category);
        const isPartiallySelected = isCategoryPartiallySelected(category);

        return (
          <div key={category} className={styles.categoryGroup}>
            <div className={styles.categoryHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.categoryName}>{category}</span>
                <span className={styles.itemCount}>{items.length}</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#6B7280' }}>
                <input
                  type="checkbox"
                  checked={isFullySelected}
                  ref={input => {
                    if (input) {
                      input.indeterminate = isPartiallySelected;
                    }
                  }}
                  onChange={() => handleSelectAll(category)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span>Select All</span>
              </label>
            </div>

            <div className={styles.menuItemsList}>
              {items.map((item, index) => {
                const isExpanded = expandedItems.includes(item.id);
                return (
                  <div key={item.id || index} className={styles.menuItem}>
                    <div
                      className={styles.menuItemCard}
                      style={{
                        border: selectedItems.has(item.id) ? '2px solid #3B82F6' : undefined,
                        backgroundColor: selectedItems.has(item.id) ? '#EFF6FF' : undefined,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleItemSelect(item.id)}
                          style={{
                            width: '16px',
                            height: '16px',
                            marginTop: '4px',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        />

                        <div style={{ display: 'flex', flex: 1, gap: '12px' }}>
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

                            {/* Updated Description Block */}
                            {item.description && (
                              <div className={styles.menuItemDescription}>
                                <div style={{
                                  maxHeight: isExpanded ? 'none' : '3.2em',
                                  overflow: 'hidden',
                                  position: 'relative'
                                }}>
                                  {formatDescription(item.description)}
                                </div>
                                {item.description.length > 60 && (
                                  <button
                                    onClick={() => toggleDescription(item.id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#2563EB',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      padding: '4px 0',
                                      marginTop: '4px'
                                    }}
                                  >
                                    {isExpanded ? "Show Less" : "Show More Details"}
                                  </button>
                                )}
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
                                          : img.image_url || img
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <BulkDeleteModal
        isOpen={bulkDeleteModal}
        onClose={handleBulkDeleteCancel}
        onConfirm={handleBulkDeleteConfirm}
        itemCount={selectedItems.size}
      />
    </div>
  );
};

export default MenuItemList;