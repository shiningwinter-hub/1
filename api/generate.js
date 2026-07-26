export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // API 키가 없어도 앱 구동 테스트가 가능하도록 기본 메시지 반환
    return res.status(200).json({ message: "타이머 시간 동안 정말 잘 집중해주셨네요! 너무 푹 잤어요 💤✨" });
  }

  const prompt = `너는 푹 자고 일어난 반려동물이야. 사용자가 미션을 성공적으로 마쳐서 기분 좋게 일어났어. 짧고 귀엽게 칭찬하는 일기를 작성해줘. 이모지도 사용해줘.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    const message = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ message });
  } catch (error) {
    return res.status(500).json({ error: '오류 발생' });
  }
}
