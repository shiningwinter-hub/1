import React, { useState, useRef } from 'react';

export default function DecibelTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const reqIdRef = useRef(null);

  const startTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      setIsTesting(true);
      checkDecibel();
    } catch (e) {
      alert('마이크 권한이 필요합니다.');
    }
  };

  const stopTest = () => {
    setIsTesting(false);
    cancelAnimationFrame(reqIdRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const checkDecibel = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const avg = sum / dataArray.length;
    const db = Math.max(0, Math.round((avg / 256) * 100 + 20)); // 임의의 DB 변환
    setCurrentDb(db);

    reqIdRef.current = requestAnimationFrame(checkDecibel);
  };

  return (
    <div>
      <h2>데시벨 테스트</h2>
      <div className="card">
        <p>현재 마이크로 들어오는 소음 크기를 확인하세요.</p>
        <h1 style={{ fontSize: '3rem', color: '#4CAF50' }}>{currentDb} dB</h1>
        {!isTesting ? (
          <button className="btn" onClick={startTest}>테스트 시작</button>
        ) : (
          <button className="btn stop" onClick={stopTest}>테스트 종료</button>
        )}
      </div>
    </div>
  );
}
