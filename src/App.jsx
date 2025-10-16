import { useState, useEffect } from 'react';

const API_URL = 'https://todo-api-ovrr.onrender.com/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');


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
        //todos.map la 1 mang moi,(se duyet qua cac phan tu trong mang, t la ten bien cua cac phan tu)
        //(điều_kiện) ? (nếu_đúng) : (nếu_sai)
        //(t=>t.id===id) ? (data.data) : (t(giu nguyen))
        //data.success
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











  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>📝 Todo App</h1>
        
        {/* Form thêm todo */}
        <div style={styles.form}>
          <input
            type="text"
            placeholder="Nhập công việc cần làm..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo(e)}
          />
          <button onClick={handleAddTodo} style={styles.button}>Thêm</button>
        </div>

        {/* Error message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Loading state */}
        {loading && <div style={styles.loading}>Đang tải...</div>}

        {/* Danh sách todos */}
        <div style={styles.todoList}>
          {todos.length === 0 ? (
            <p style={styles.empty}>Chưa có todo nào. Hãy thêm một cái! 🚀</p>
          ) : (
            todos.map(todo => (
              <div key={todo.id} style={styles.todoItem}>
                <div style={styles.todoContent}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id, todo.completed)}
                    style={styles.checkbox}
                  />
                  
                  {/* Nếu đang edit → hiển thị input */}
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      style={{
                        ...styles.input,
                        flex: 1,
                        marginRight: '10px'
                      }}
                      autoFocus
                    />
                  ) : (
                    /* Nếu không edit → hiển thị text */
                    <span style={{
                      ...styles.todoTitle,
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? '#999' : '#333',
                      opacity: todo.completed ? 0.6 : 1
                    }}>
                      {todo.title}
                    </span>
                  )}
                </div>
                
                {/* Buttons */}
                <div style={styles.buttonGroup}>
                  {editingId === todo.id ? (
                    <>
                      {/* Khi đang edit: Lưu & Hủy */}
                      <button
                        onClick={() => handleSaveEdit(todo.id)}
                        style={{
                          ...styles.saveBtn,
                          marginRight: '5px'
                        }}
                      >
                        Lưu
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={styles.cancelBtn}
                      >
                        Hủy
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Khi không edit: Sửa & Xóa */}
                      <button
                        onClick={() => handleStartEdit(todo.id, todo.title)}
                        style={{
                          ...styles.editBtn,
                          marginRight: '5px'
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        style={styles.deleteBtn}
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
        {todos.length > 0 && (
          <div style={styles.stats}>
            <p>Tổng: {todos.length} | Hoàn thành: {todos.filter(t => t.completed).length}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '30px',
    width: '100%',
    maxWidth: '500px'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
    fontSize: '28px'
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  },
  input: {
    flex: 1,
    padding: '10px 15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s'
  },
  error: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    color: '#666',
    fontSize: '14px'
  },
  todoList: {
    marginBottom: '20px',
    maxHeight: '400px',
    overflowY: 'auto'
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '30px 0',
    fontSize: '14px'
  },
  todoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    marginBottom: '10px',
    border: '1px solid #eee'
  },
  todoContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  todoTitle: {
    fontSize: '15px',
    flex: 1
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.3s'
  },
  stats: {
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    color: '#666',
    fontSize: '13px'
  },
  buttonGroup: {
  display: 'flex',
  gap: '5px',
  flexShrink: 0
  },
  editBtn: {
    padding: '6px 12px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.3s'
  },
  saveBtn: {
    padding: '6px 12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.3s'
  },
  cancelBtn: {
    padding: '6px 12px',
    backgroundColor: '#9E9E9E',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background-color 0.3s'
  }

  





};