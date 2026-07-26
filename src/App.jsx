import React, { useState } from 'react';
import DecibelTest from './pages/DecibelTest';
import MissionStart from './pages/MissionStart';
import TodoList from './pages/TodoList';

function App() {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <div className="app-container">
      <div className="content">
        {/* display 속성으로 탭을 숨겨서 타이머와 상태가 초기화되지 않도록 유지합니다. */}
        <div style={{ display: activeTab === 'test' ? 'block' : 'none' }}>
          <DecibelTest />
        </div>
        <div style={{ display: activeTab === 'mission' ? 'block' : 'none' }}>
          <MissionStart />
        </div>
        <div style={{ display: activeTab === 'todo' ? 'block' : 'none' }}>
          <TodoList />
        </div>
      </div>

      <nav className="bottom-nav">
        <button 
          className={activeTab === 'test' ? 'active' : ''} 
          onClick={() => setActiveTab('test')}
        >
          데시벨 테스트
        </button>
        <button 
          className={activeTab === 'mission' ? 'active' : ''} 
          onClick={() => setActiveTab('mission')}
        >
          미션 시작
        </button>
        <button 
          className={activeTab === 'todo' ? 'active' : ''} 
          onClick={() => setActiveTab('todo')}
        >
          오늘의 할 일
        </button>
      </nav>
    </div>
  );
}

export default App;
