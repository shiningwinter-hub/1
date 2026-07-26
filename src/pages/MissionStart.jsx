import React, { useState, useRef, useEffect } from 'react';

const CHARACTERS = {
  rabbit: { sleep: '🐰💤', wake: '🐰👀', happy: '🐇✨', name: '토끼' },
  bear: { sleep: '🐻💤', wake: '🐻👀', happy: '🧸✨', name: '곰' },
  fox: { sleep: '🦊💤', wake: '🦊👀', happy: '🦊✨', name: '여우' },
  puppy: { sleep: '🐶💤', wake: '🐶👀', happy: '🐕✨', name: '강아지' },
  cat: { sleep: '🐱💤', wake: '🐱👀', happy: '🐈✨', name: '고양이' }
};

export default function MissionStart() {
  const [charKey, setCharKey] = useState('rabbit');
  const [threshold, setThreshold] = useState(50);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentDb, setCurrentDb] = useState(0);
  const [petState, setPetState] = useState('sleep'); // 'sleep', 'wake', 'happy'
  const [statusMsg, setStatusMsg] = useState('설정을 완료하고 미션을 시작하세요!');
  const [feedback, setFeedback] = useState('');

  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const reqIdRef = useRef(null);

  // DB 체크 로직
  const checkDecibel = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const avg = sum / dataArray.length;
    const db = Math.max(0, Math.round((avg / 256) * 100 + 20));
    setCurrentDb(db);

    if (db > threshold) {
      setPetState('wake');
      setStatusMsg(`앗! 소음(${db}dB) 때문에 깼어요!`);
    } else {
      setPetState('sleep');
      setStatusMsg('쉿.. 잘 자고 있어요.');
    }

    reqIdRef.current = requestAnimationFrame(checkDecibel);
  };

  const startMission = async () => {
    const totalSeconds = (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
    if (totalSeconds <= 0) {
      alert('시간을 설정해주세요!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setTimeLeft(totalSeconds);
      setIsRunning(true);
      setPetState('sleep');
      setStatusMsg('미션 시작!');
      setFeedback('');

      checkDecibel();

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopMission(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (e) {
      alert('마이크 권한이 필요합니다.');
    }
  };

  const stopMission = (completed = false) => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    cancelAnimationFrame(reqIdRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (completed) {
      setPetState('happy');
      setStatusMsg('미션 완료! 기분 좋게 일어났어요!');
      fetchFeedback();
    } else {
      setPetState('wake');
      setStatusMsg('미션이 중지되었습니다.');
    }
  };

  const fetchFeedback = async () => {
    setFeedback('AI가 일기를 쓰는 중... ✍️');
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const data = await res.json();
      if(data.message) {
         setFeedback(data.message);
      } else {
         setFeedback("오늘도 조용히 해줘서 고마워요!");
      }
    } catch(e) {
      setFeedback("수고하셨습니다!");
    }
  };

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div>
      <h2>미션 시작</h2>
      <div className="card">
        <div className="char-display">
          {CHARACTERS[charKey][petState]}
        </div>
        <p style={{ fontWeight: 'bold' }}>{statusMsg}</p>
        
        {isRunning && (
          <div>
            <div className="timer-display">{formatTime(timeLeft)}</div>
            <p style={{ color: '#888' }}>현재: {currentDb}dB / 기준: {threshold}dB</p>
          </div>
        )}
      </div>

      {!isRunning ? (
        <div className="card" style={{ textAlign: 'left' }}>
          <h4>설정</h4>
          <label>캐릭터 선택</label>
          <select value={charKey} onChange={e => setCharKey(e.target.value)}>
            {Object.entries(CHARACTERS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          
          <label>기준 데시벨 (dB)</label>
          <input type="number" value={threshold} onChange={e => setThreshold(e.target.value)} />

          <label>타이머 설정</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input type="number" placeholder="시" value={hours} onChange={e => setHours(e.target.value)} />
            <input type="number" placeholder="분" value={minutes} onChange={e => setMinutes(e.target.value)} />
            <input type="number" placeholder="초" value={seconds} onChange={e => setSeconds(e.target.value)} />
          </div>

          <button className="btn" style={{ width: '100%', marginTop: '15px' }} onClick={startMission}>
            시작하기
          </button>
        </div>
      ) : (
        <button className="btn stop" style={{ width: '100%' }} onClick={() => stopMission(false)}>
          정지하기
        </button>
      )}

      {feedback && (
        <div className="card" style={{ background: '#eef2ff', whiteSpace: 'pre-wrap' }}>
          {feedback}
        </div>
      )}
    </div>
  );
}
