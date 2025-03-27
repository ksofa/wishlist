import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, WishList } from '../../services/api';

export function WishListsList() {
  const [wishlists, setWishlists] = useState<WishList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.wishlists.getAll();
      setWishlists(response.data);
    } catch (error) {
      console.error('Failed to load wishlists', error);
      setError('Не удалось загрузить списки желаний. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.wishlists.create({
        name: newListName.trim(),
        description: newListDescription.trim() || undefined
      });
      
      setWishlists([...wishlists, response.data]);
      setNewListName('');
      setNewListDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create wishlist', error);
      setError('Не удалось создать список желаний. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto mt-8 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center">
            <div className="animate-pulse h-6 w-32 bg-gray-300 rounded"></div>
          </div>
          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Мои списки желаний</h2>
          {!showCreateForm && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Создать список
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Создать новый список</h3>
            <form onSubmit={handleCreateList}>
              <div className="mb-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Название *
                </label>
                <input
                  type="text"
                  id="name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  id="description"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewListName('');
                    setNewListDescription('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSubmitting || !newListName.trim()}
                >
                  {isSubmitting ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        )}

        {wishlists.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600">У вас пока нет списков желаний.</p>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-2 text-blue-600 hover:underline"
              >
                Создать первый список
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {wishlists.map((wishlist) => (
              <Link
                key={wishlist.id}
                to={`/wishlists/${wishlist.id}`}
                className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">{wishlist.name}</h3>
                    {wishlist.description && (
                      <p className="text-gray-600 text-sm mt-1">{wishlist.description}</p>
                    )}
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <span>{wishlist.items.length} предметов</span>
                      <span className="mx-2">•</span>
                      <span>Создан {new Date(wishlist.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {wishlist.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 