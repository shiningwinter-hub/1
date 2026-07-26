// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { duration, wakes } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API 키가 설정되지 않았습니다.' });
  }

  const prompt = `
  너는 잠을 자고 일어난 귀여운 '토끼'야. 사용자가 설정한 타이머 동안 자고 일어났어.
  - 잔 시간: ${duration}분
  - 자는 동안 깬 횟수: ${wakes}번

  이 데이터를 바탕으로 토끼의 시점에서 짧고 귀엽게 결과를 요약하고 평가해줘.
  
  조건:
  1. 깬 횟수가 0~1번이면 아주 칭찬해줄 것.
  2. 깬 횟수가 너무 많으면 약간 투정 부리면서 다음엔 조용히 해달라고 할 것.
  3. 이모지(🐰, 💤 등)를 적절히 섞어서 3문장 이내로 작성할 것.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API 호출 실패');
    }

    const message = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ message });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: '결과를 생성하는 중 오류가 발생했습니다.' });
  }
}
