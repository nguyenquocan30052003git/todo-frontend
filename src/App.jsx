import { useState, useEffect } from 'react';

const API_URL = 'https://todo-api-ovrr.onrender.com/api/todos';
const CATEGORIES_URL = 'https://todo-api-ovrr.onrender.com/api/categories';

export default function App() {
  // Todos state
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Categories state
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#4CAF50');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // 1️⃣ Load data on mount
  useEffect(() => {
    fetchCategories();
    fetchTodos();
  }, []);

  // 2️⃣ GET - Lấy categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_URL);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Lỗi fetch categories:', err);
    }
  };

  // 3️⃣ GET - Lấy todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setTodos(data.data);
      } else {
        setError('Lỗi: Không thể lấy danh sách');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4️⃣ POST - Tạo category mới
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError('Category name không được để trống!');
      return;
    }

    addCategory();
  };
  const addCategory = async () => {
    try {
      setError('');
      const response = await fetch(CATEGORIES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          color: newCategoryColor
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setNewCategoryName('');
        setNewCategoryColor('#4CAF50');
        setShowCategoryForm(false);
      } else {
        setError('Lỗi: Không thể tạo category');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  }

  // 4.1 DELETE - Xóa categories
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa?')) return;
    
    try {
      setError('');
      const response = await fetch(`${CATEGORIES_URL}/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setCategories(categories.filter(t => t.id !== id));
      } else {
        setError('Lỗi: Không thể xóa category 2');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };








  // 5️⃣ POST - Thêm todo mới
  const handleAddTodo = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title không được để trống!');
      return;
    }

    addTodo();
  };

  const addTodo = async () => {
    try {
      setError('');
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category_id: selectedCategory ? parseInt(selectedCategory) : null
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setTodos([data.data, ...todos]);
        setTitle('');
        setSelectedCategory('');
      } else {
        setError('Lỗi: Không thể thêm todo');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  // 6️⃣ PUT - Toggle completed
  const handleToggleTodo = async (id, completed, categoryId) => {
    try {
      setError('');
      const todo = todos.find(t => t.id === id);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todo.title,
          completed: !completed,
          category_id: categoryId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setTodos(todos.map(t => t.id === id ? data.data : t));
      } else {
        setError('Lỗi: Không thể cập nhật todo');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  // 7️⃣ DELETE - Xóa todo
  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa?')) return;
    
    try {
      setError('');
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        setTodos(todos.filter(t => t.id !== id));
      } else {
        setError('Lỗi: Không thể xóa todo');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  // 8️⃣ EDIT - Start edit
  const handleStartEdit = (id, currentTitle) => {
    setEditingId(id);
    setEditValue(currentTitle);
    setError('');
  };

  // 9️⃣ EDIT - Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // 🔟 EDIT - Save edit
  const handleSaveEdit = async (id) => {
    if (!editValue.trim()) {
      setError('Title không được để trống!');
      return;
    }

    try {
      setError('');
      const todo = todos.find(t => t.id === id);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editValue.trim(),
          completed: todo.completed,
          category_id: todo.category_id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setTodos(todos.map(t => t.id === id ? data.data : t));
        setEditingId(null);
        setEditValue('');
      } else {
        setError('Lỗi: Không thể cập nhật title');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  // 1️⃣1️⃣ SEARCH & FILTER
  const getFilteredTodos = () => {
    let filtered = todos;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(t => t.category_id === parseInt(selectedCategory));
    }

    // Filter by search text
    if (searchText.trim()) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#999';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'No Category';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">📝 Todo App with Categories</h1>
          <p className="text-gray-600">Quản lý công việc theo danh mục</p>
        </div>

        {/* Main container */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          
          {/* Sidebar - Categories */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-1 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📂 Categories</h2>
              
              {/* Category list */}
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition ${
                    selectedCategory === ''
                      ? 'bg-gray-200 text-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Todos
                </button>
                
                
                {categories.map(cat => (
                  <div key={cat.id} className="flex gap-2 flex-shrink-0  min-w-0">
                    <>
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id.toString())}
                    className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                      selectedCategory === cat.id.toString()
                        ? 'bg-gray-200 text-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    ></div>
                    < div className="break-words" >{cat.name} </div> 
                    
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="px-3 py-2 bg-danger text-white rounded font-semibold text-sm hover:bg-red-600 transition"
                    >
                    Delete
                    </button>
                    </> 
                  </div>
                  
                ))}
                
              </div>

              {/* Add category button */}
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                + Add Category
              </button>

              {/* Add category form */}
              {showCategoryForm && (
                <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-full h-10 rounded mb-2 cursor-pointer"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 px-3 py-2 bg-primary text-white rounded font-semibold text-sm hover:bg-green-600 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowCategoryForm(false)}
                      className="flex-1 px-3 py-2 bg-gray-400 text-white rounded font-semibold text-sm hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main content - Todos */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-xl p-6">
              
              {/* Search Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm todo..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-info transition"
                />
                {searchText && (
                  <p className="text-sm text-gray-600 mt-2">
                    Tìm thấy: <span className="font-bold text-primary">{getFilteredTodos().length}</span> kết quả
                  </p>
                )}
              </div>

              {/* Add todo form */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-800 mb-3">➕ Thêm Todo Mới</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập công việc cần làm..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo(e)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddTodo}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-600 transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              {/* Loading state */}
              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-gray-600 mt-3">Đang tải...</p>
                </div>
              )}

              {/* Todos list */}
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {getFilteredTodos().length === 0 ? (
                  <p className="text-center text-gray-400 py-12">
                    {searchText ? '🔍 Không tìm thấy kết quả' : '🚀 Chưa có todo nào'}
                  </p>
                ) : (
                  getFilteredTodos().map(todo => (
                    <div key={todo.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo.id, todo.completed, todo.category_id)}
                        className="w-5 h-5 cursor-pointer accent-primary flex-shrink-0"
                      />

                      {/* Category badge */}
                      {todo.category_id && (
                        <div
                          className="px-3 py-1 rounded-full text-white text-xs font-semibold flex-shrink-0"
                          style={{ backgroundColor: getCategoryColor(todo.category_id) }}
                        >
                          {getCategoryName(todo.category_id)}
                          
                        </div>
                        
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {editingId === todo.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                          />
                        ) : (
                          <span className={`block break-words ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {todo.title}
                          </span>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        {editingId === todo.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(todo.id)}
                              className="px-3 py-2 bg-primary text-white rounded font-semibold text-sm hover:bg-green-600 transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-2 bg-gray-400 text-white rounded font-semibold text-sm hover:bg-gray-500 transition"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(todo.id, todo.title)}
                              className="px-3 py-2 bg-info text-white rounded font-semibold text-sm hover:bg-blue-600 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="px-3 py-2 bg-danger text-white rounded font-semibold text-sm hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Stats */}
              {getFilteredTodos().length > 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{getFilteredTodos().length}</p>
                      <p className="text-sm text-gray-600">Tổng</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{getFilteredTodos().filter(t => t.completed).length}</p>
                      <p className="text-sm text-gray-600">Hoàn thành</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{getFilteredTodos().filter(t => !t.completed).length}</p>
                      <p className="text-sm text-gray-600">Còn lại</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>💪 Relationships & Foreign Keys!</p>
        </div>
      </div>
    </div>
  );
}