import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, WishList } from '../../services/api';

export function SharedWishList() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [wishlist, setWishlist] = useState<WishList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareCode) return;
    loadWishlist();
  }, [shareCode]);

  const loadWishlist = async () => {
    if (!shareCode) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.wishlists.getByShareCode(shareCode);
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to load shared wishlist', error);
      setError('Список желаний не найден или недоступен');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto mt-8 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-6"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-3">
                  <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="container mx-auto mt-8 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {error || 'Список желаний не найден'}
            </h2>
            <p className="text-gray-600 mb-4">
              Возможно, этот список больше не является общедоступным или был удалён.
            </p>
            <Link to="/" className="text-blue-600 hover:underline">
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-8 border-b pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{wishlist.name}</h2>
              {wishlist.description && (
                <p className="text-gray-600 mt-2">{wishlist.description}</p>
              )}
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span>Создан {new Date(wishlist.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Список желаний</h3>
          
          {wishlist.items.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">В этом списке пока нет элементов.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.items.map((item) => (
                <div key={item.id} className="border-b pb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">{item.name}</h4>
                    {item.description && (
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.priority === 0 ? 'bg-gray-100 text-gray-800' :
                        item.priority === 1 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.priority === 0 ? 'Низкий' : 
                         item.priority === 1 ? 'Средний' : 'Высокий'} приоритет
                      </span>
                      <span className="ml-3 text-xs text-gray-500">
                        {item.status === 'pending' ? 'Не выбрано' : 
                         item.status === 'reserved' ? 'Зарезервировано' : 
                         'Подарено'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 