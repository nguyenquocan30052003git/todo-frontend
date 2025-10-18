import { useState, useEffect } from 'react';

const API_URL = 'https://todo-api-ovrr.onrender.com/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [searchText, setSearchText] = useState('');

  // 1️⃣ GET - Lấy danh sách todos khi component load
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
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

  // 2️⃣ POST - Thêm todo mới
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
        body: JSON.stringify({ title: title.trim() })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTodos([data.data, ...todos]);
        setTitle('');
      } else {
        setError('Lỗi: Không thể thêm todo');
      }
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    }
  };

  // 3️⃣ PUT - Cập nhật todo (toggle completed)
  const handleToggleTodo = async (id, completed) => {
    try {
      setError('');
      const todo = todos.find(t => t.id === id);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todo.title,
          completed: !completed
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

  // 4️⃣ DELETE - Xóa todo
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

  // 5️⃣ EDIT - Bước vào edit mode
  const handleStartEdit = (id, currentTitle) => {
    setEditingId(id);
    setEditValue(currentTitle);
    setError('');
  };

  // 6️⃣ EDIT - Hủy edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // 7️⃣ EDIT - Lưu title mới
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
          completed: todo.completed
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

  // 8️⃣ SEARCH - Lọc todos theo text
  const getFilteredTodos = () => {
    if (!searchText.trim()) {
      return todos;
    }
    return todos.filter(todo =>
      todo.title.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">📝 Todo App</h1>
          <p className="text-gray-600">Quản lý công việc của bạn một cách hiệu quả</p>
        </div>

        {/* Card chính */}
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

          {/* Form thêm todo */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Nhập công việc cần làm..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo(e)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
            <button
              onClick={handleAddTodo}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-green-600 transition shadow-md"
            >
              Thêm
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-gray-600 mt-3">Đang tải...</p>
            </div>
          )}

          {/* Danh sách todos */}
          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            {getFilteredTodos().length === 0 ? (
              <p className="text-center text-gray-400 py-12">
                {searchText ? '🔍 Không tìm thấy kết quả' : '🚀 Chưa có todo nào. Hãy thêm một cái!'}
              </p>
            ) : (
              getFilteredTodos().map(todo => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id, todo.completed)}
                    className="w-5 h-5 cursor-pointer accent-primary flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      /* Edit mode */
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                    ) : (
                      /* View mode */
                      <span
                        className={`block break-words ${
                          todo.completed
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.title}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {editingId === todo.id ? (
                      <>
                        {/* Save & Cancel */}
                        <button
                          onClick={() => handleSaveEdit(todo.id)}
                          className="px-3 py-2 bg-primary text-white rounded font-semibold text-sm hover:bg-green-600 transition"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-2 bg-gray-400 text-white rounded font-semibold text-sm hover:bg-gray-500 transition"
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Edit & Delete */}
                        <button
                          onClick={() => handleStartEdit(todo.id, todo.title)}
                          className="px-3 py-2 bg-info text-white rounded font-semibold text-sm hover:bg-blue-600 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="px-3 py-2 bg-danger text-white rounded font-semibold text-sm hover:bg-red-600 transition"
                        >
                          Xóa
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

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>💪 Keep learning, keep building!</p>
        </div>
      </div>
    </div>
  );
}