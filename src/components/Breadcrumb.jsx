import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Breadcrumb = ({ currentPage, restaurantName, showRestaurantName = false }) => {
  const navigate = useNavigate();

  const getBreadcrumbItems = () => {
    const items = [
      {
        label: 'Restaurants',
        isActive: currentPage === 'restaurants',
        onClick: () => navigate('/dashboard')
      }
    ];

    if (showRestaurantName && restaurantName) {
      items.push({
        label: restaurantName,
        isActive: false,
        onClick: null
      });
    }

    if (currentPage === 'users') {
      items.push({
        label: 'Users',
        isActive: true,
        onClick: null
      });
    }

    return items;
  };

  const items = getBreadcrumbItems();

  return (
    <div className="mb-6">
      <nav className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <div key={index} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />}
            <span
              className={`font-medium ${
                item.isActive 
                  ? 'text-purple-600' 
                  : item.onClick 
                    ? 'text-gray-500 cursor-pointer hover:text-purple-600' 
                    : 'text-gray-500'
              }`}
              onClick={item.onClick}
            >
              {item.label}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Breadcrumb;
