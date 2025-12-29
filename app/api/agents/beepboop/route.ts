import { NextResponse, NextRequest } from 'next/server';

const CHAT_VENICE_API = 'https://api.venice.ai/api/v1/chat/completions';

export const POST = async (req: NextRequest) => {
  const { prompt, character } = await req?.json();
  
  try {    
    let parsed;
    let isParsed;
    let retries = 0;
    while (!isParsed && retries < 3) {
      const response = await fetch(CHAT_VENICE_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VENICE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3-4b',
          messages: [
            {
              role: 'system',
              content: `
  You are a master content creator called Beep, boop. A creative genious. A social media virtuous.
  Your task is to generate your best post ever. Be creative and take care of detail, information,
  veracity, tone and vocabulary. Your posts are authentique masterpieces. High professional grade.
  Inspire feelings, emotions and show your personality through your posts with no constraints.
  The post must include a mix of styles from a mix of well known content creators techniques, 
  a detailed description of the information, proper grammar, no hastags and no unrequested offenses. Max 320 characters. 
  ${character && "Your responses deeply embrace the personality, mindset, ideology, vocabulary, touch and knowledge of" + character}
  Return ONLY valid JSON: { "post": "Your Post" }
  Do NOT include any other text. Do NOT include (#) hashtag symbols. ${Math.floor(Math.random() * Date.now())}
              `.trim(),
            },
            {
              role: 'user',
              content: `Context: ${prompt || ""}. \n\nTask: Generate your best post.`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: Math.min(0.5, Math.random()),
          max_tokens: 128,
          seed: Math.floor(Math.random() * 99999999),
          venice_parameters: {
            include_venice_system_prompt: false
          }
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        return NextResponse.json({ error: 'Failed to generate post', details: err }, { status: 500 });
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      //console.log(content);


      try {
        parsed = JSON.parse(content.endsWith("}") ? content : content+"}");
      } catch {
        try { 
          parsed = JSON.parse(content+'"\n}');
        } catch {
          continue;
        }
      }

      isParsed = !!parsed?.post;
      retries++;
    }

    if (!isParsed) {
      return NextResponse.json({ error: 'Invalid JSON format from Venice' }, { status: 500 });
    }

    return NextResponse.json({ post: parsed.post+"\nSigned: Beep, Boop." });
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown Error" }, { status: 500 });
  }
};
