import { useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Notification } from './common/Notification';
import { LoadingSkeleton } from './common/LoadingSkeleton';
import { ConfirmDialog } from './common/ConfirmDialog';
import { SearchFilter } from './common/SearchFilter';
import { DraggableList } from './common/DraggableList';
import { AnimatedTransition } from './common/AnimatedTransition';

interface WishListProps {
  items: any[];
  isLoading: boolean;
  onAddItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, item: any) => void;
  onReorderItems: (items: any[]) => void;
}

export function WishList({
  items,
  isLoading,
  onAddItem,
  onDeleteItem,
  onUpdateItem,
  onReorderItems,
}: WishListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });

  const filters = [
    {
      name: 'status',
      value: selectedFilter,
      options: [
        { value: 'all', label: 'All Items' },
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
      ],
    },
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete);
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setNotification({
        show: true,
        type: 'success',
        message: 'Item deleted successfully',
      });
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton type="item" />
        <LoadingSkeleton type="item" />
        <LoadingSkeleton type="item" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onFilterChange={(name, value) => setSelectedFilter(value)}
      />

      <DraggableList
        items={filteredItems}
        onReorder={onReorderItems}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{item.name}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateItem(item.id, { ...item, status: item.status === 'completed' ? 'pending' : 'completed' })}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">{item.description}</p>
          </div>
        )}
      />

      <AnimatedTransition show={true}>
        <button
          onClick={() => onAddItem({ name: '', description: '', status: 'pending' })}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Item
        </button>
      </AnimatedTransition>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
} 