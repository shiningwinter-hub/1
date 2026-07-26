import React, { useState } from 'react';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '물 마시기', done: false }
  ]);
  const [inputText, setInputText] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setTodos([...todos, { id: Date.now(), text: inputText, done: false }]);
    setInputText('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  return (
    <div>
      <h2>오늘의 할 일</h2>
      <div className="card">
        <form onSubmit={addTodo} style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="할 일을 입력하세요" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn" style={{ width: '80px', margin: '0' }}>추가</button>
        </form>

        <div style={{ textAlign: 'left' }}>
          {todos.map(todo => (
            <label key={todo.id} className={`todo-item ${todo.done ? 'done' : ''}`}>
              <input 
                type="checkbox" 
                checked={todo.done} 
                onChange={() => toggleTodo(todo.id)} 
              />
              <span>{todo.text}</span>
            </label>
          ))}
          {todos.length === 0 && <p style={{ textAlign:'center', color:'#999' }}>할 일이 없습니다.</p>}
        </div>
      </div>
    </div>
  );
}
