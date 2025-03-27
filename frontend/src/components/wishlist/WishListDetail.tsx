import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, WishList, WishItem, CreateWishItemRequest } from '../../services/api';

export function WishListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPriority, setNewItemPriority] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    id: number;
    name: string;
    description: string;
    priority: number;
  } | null>(null);
  const [showShareSettings, setShowShareSettings] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadWishlist();
  }, [id]);

  const loadWishlist = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.wishlists.getById(parseInt(id));
      setWishlist(response.data);
      setName(response.data.name);
      setDescription(response.data.description || '');
      if (response.data.is_public !== undefined) {
        setIsPublic(response.data.is_public);
      }
      if (response.data.share_code) {
        const baseUrl = window.location.origin;
        setShareUrl(`${baseUrl}/shared/${response.data.share_code}`);
      }
    } catch (error) {
      console.error('Failed to load wishlist', error);
      setError('Не удалось загрузить данные списка желаний. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlist || !id) return;
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.wishlists.update(parseInt(id), {
        name: name.trim(),
        description: description.trim() || undefined
      });
      
      setWishlist(response.data);
      setShowEditForm(false);
    } catch (error) {
      console.error('Failed to update wishlist', error);
      setError('Не удалось обновить список желаний. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!wishlist || !id) return;
    
    if (!window.confirm('Вы уверены, что хотите удалить этот список желаний?')) {
      return;
    }

    try {
      await api.wishlists.delete(parseInt(id));
      navigate('/wishlists');
    } catch (error) {
      console.error('Failed to delete wishlist', error);
      setError('Не удалось удалить список желаний. Пожалуйста, попробуйте позже.');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlist || !id) return;
    if (!newItemName.trim()) return;

    setIsSubmitting(true);
    try {
      const data: CreateWishItemRequest = {
        name: newItemName.trim(),
        description: newItemDescription.trim() || undefined,
        priority: newItemPriority
      };
      
      console.log('Creating item with data:', data);
      const response = await api.items.create(parseInt(id), data);
      console.log('Item created successfully:', response.data);
      
      // Обновляем список, добавляя новый элемент
      setWishlist({
        ...wishlist,
        items: [...wishlist.items, response.data]
      });
      
      // Сбрасываем форму
      setNewItemName('');
      setNewItemDescription('');
      setNewItemPriority(0);
      setShowAddItemForm(false);
    } catch (error: any) {
      console.error('Failed to add item', error);
      // Подробное логирование ошибки
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      setError('Не удалось добавить элемент. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlist || !id || !editingItem) return;
    if (!editingItem.name.trim()) return;

    setIsSubmitting(true);
    try {
      const data = {
        name: editingItem.name.trim(),
        description: editingItem.description.trim() || undefined,
        priority: editingItem.priority
      };
      
      const response = await api.items.update(parseInt(id), editingItem.id, data);
      
      // Обновляем список, заменяя обновленный элемент
      setWishlist({
        ...wishlist,
        items: wishlist.items.map(item => 
          item.id === editingItem.id ? response.data : item
        )
      });
      
      // Сбрасываем форму редактирования
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update item', error);
      setError('Не удалось обновить элемент. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!wishlist || !id) return;
    
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      return;
    }

    try {
      await api.items.delete(parseInt(id), itemId);
      
      // Обновляем список, удаляя элемент
      setWishlist({
        ...wishlist,
        items: wishlist.items.filter(item => item.id !== itemId)
      });
    } catch (error) {
      console.error('Failed to delete item', error);
      setError('Не удалось удалить элемент. Пожалуйста, попробуйте позже.');
    }
  };

  const handleShareSettingsUpdate = async () => {
    if (!wishlist || !id) return;
    
    setIsSubmitting(true);
    try {
      const response = await api.wishlists.updateShareSettings(parseInt(id), {
        is_public: isPublic
      });
      
      setWishlist(response.data);
      
      if (response.data.is_public && !shareUrl && !response.data.share_code) {
        handleGenerateShareCode();
      } else if (!response.data.is_public) {
        setShareUrl(null);
      }
      
      setShowShareSettings(false);
    } catch (error) {
      console.error('Failed to update share settings', error);
      setError('Не удалось обновить настройки общего доступа. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateShareCode = async () => {
    if (!wishlist || !id) return;
    
    setIsGeneratingCode(true);
    try {
      const response = await api.wishlists.generateShareCode(parseInt(id));
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/shared/${response.data.share_code}`);
      
      // Обновляем wishlist, чтобы включить новый share_code
      const updatedWishlist = await api.wishlists.getById(parseInt(id));
      setWishlist(updatedWishlist.data);
    } catch (error) {
      console.error('Failed to generate share code', error);
      setError('Не удалось создать ссылку для общего доступа. Пожалуйста, попробуйте позже.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      })
      .catch(() => {
        setError('Не удалось скопировать ссылку. Попробуйте еще раз.');
      });
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

  if (error && !wishlist) {
    return (
      <div className="container mx-auto mt-8 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ошибка</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Link to="/wishlists" className="text-blue-600 hover:underline">
              Вернуться к списку
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="container mx-auto mt-8 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Список не найден</h2>
            <Link to="/wishlists" className="text-blue-600 hover:underline">
              Вернуться к списку
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-start">
            {showEditForm ? (
              <form onSubmit={handleUpdate} className="w-full">
                <div className="mb-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setName(wishlist.name);
                      setDescription(wishlist.description || '');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isSubmitting || !name.trim()}
                  >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{wishlist.name}</h2>
                  {wishlist.description && (
                    <p className="text-gray-600 mt-2">{wishlist.description}</p>
                  )}
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span>Создан {new Date(wishlist.created_at).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>Статус: {wishlist.status}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
                  >
                    Удалить
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Элементы списка</h3>
            {!showAddItemForm && (
              <button
                onClick={() => setShowAddItemForm(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Добавить элемент
              </button>
            )}
          </div>

          {showAddItemForm && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Добавить новый элемент</h4>
              <form onSubmit={handleAddItem}>
                <div className="mb-3">
                  <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                    Название *
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    id="itemDescription"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="itemPriority" className="block text-sm font-medium text-gray-700 mb-1">
                    Приоритет
                  </label>
                  <select
                    id="itemPriority"
                    value={newItemPriority}
                    onChange={(e) => setNewItemPriority(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">Низкий</option>
                    <option value="1">Средний</option>
                    <option value="2">Высокий</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddItemForm(false);
                      setNewItemName('');
                      setNewItemDescription('');
                      setNewItemPriority(0);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isSubmitting || !newItemName.trim()}
                  >
                    {isSubmitting ? 'Добавление...' : 'Добавить'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {wishlist.items.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600">В этом списке пока нет элементов.</p>
              {!showAddItemForm && (
                <button
                  onClick={() => setShowAddItemForm(true)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Добавить первый элемент
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.items.map((item) => (
                <div
                  key={item.id}
                  className={`border-b pb-4 ${
                    editingItem && editingItem.id === item.id ? 'bg-blue-50 p-3 rounded-lg' : ''
                  }`}
                >
                  {editingItem && editingItem.id === item.id ? (
                    <form onSubmit={handleUpdateItem}>
                      <div className="mb-3">
                        <label htmlFor={`editItemName-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Название *
                        </label>
                        <input
                          type="text"
                          id={`editItemName-${item.id}`}
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor={`editItemDescription-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Описание
                        </label>
                        <textarea
                          id={`editItemDescription-${item.id}`}
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label htmlFor={`editItemPriority-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Приоритет
                        </label>
                        <select
                          id={`editItemPriority-${item.id}`}
                          value={editingItem.priority}
                          onChange={(e) => setEditingItem({ ...editingItem, priority: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={0}>Низкий</option>
                          <option value={1}>Средний</option>
                          <option value={2}>Высокий</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          disabled={isSubmitting}
                        >
                          Отмена
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          disabled={isSubmitting || !editingItem.name.trim()}
                        >
                          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex justify-between items-start">
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
                            Добавлен {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingItem({
                            id: item.id,
                            name: item.name,
                            description: item.description || '',
                            priority: item.priority
                          })}
                          className="px-2 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Изменить
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2 py-1 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!showEditForm && (
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">Настройки доступа</h3>
              {!showShareSettings && (
                <button
                  onClick={() => setShowShareSettings(true)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Настроить доступ
                </button>
              )}
            </div>
            
            {showShareSettings ? (
              <div className="mt-3 bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">Сделать список общедоступным</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    Общедоступные списки можно просматривать по ссылке без входа в систему.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareSettings(false);
                      setIsPublic(wishlist.is_public);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={handleShareSettingsUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-gray-600">
                  Статус: {wishlist.is_public ? 'Общедоступный' : 'Приватный'}
                </p>
                
                {wishlist.is_public && (
                  <div className="mt-3">
                    {shareUrl ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={handleCopyLink}
                            className={`px-4 py-2 rounded-r-md focus:outline-none ${
                              copySuccess
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {copySuccess ? 'Скопировано!' : 'Копировать'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">
                          По этой ссылке любой может посмотреть ваш список желаний.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerateShareCode}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        disabled={isGeneratingCode}
                      >
                        {isGeneratingCode ? 'Создание ссылки...' : 'Создать ссылку для общего доступа'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 