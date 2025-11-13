import Sidebar from '../components/Sidebar';
import Restaurants from '../components/Restaurants';

const RestaurantsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />

            <div className="flex-1 p-8 max-h-[100vh] overflow-y-auto">
                <Restaurants />
            </div>
        </div>
    );
};

export default RestaurantsPage;
