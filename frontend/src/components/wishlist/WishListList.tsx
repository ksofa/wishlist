import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { WishList } from '../../api/client';
import { Link } from 'react-router-dom';

export function WishListList() {
  const [isCreating, setIsCreating] = useState(false);
  const [newWishListName, setNewWishListName] = useState('');

  const { data: wishLists, isLoading } = useQuery({
    queryKey: ['wishlists'],
    queryFn: () => api.wishlists.list(),
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishListName.trim()) return;

    try {
      await api.wishlists.create(newWishListName);
      setNewWishListName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create wishlist:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlists</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create New Wishlist
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newWishListName}
              onChange={(e) => setNewWishListName(e.target.value)}
              placeholder="Enter wishlist name"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishLists?.data?.map((wishList: WishList) => (
          <Link
            key={wishList.id}
            to={`/wishlists/${wishList.id}`}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {wishList.name}
            </h2>
            <p className="text-gray-600">
              {wishList.items.length} items
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Created {new Date(wishList.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 