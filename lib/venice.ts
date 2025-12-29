export async function generatePost(prompt: string, character: string): Promise<string> {
  if (!prompt) return "";
  
  const res = await fetch('/api/agents/beepboop', {
    method: 'POST',
    headers: { 
      //Authorization: process.env.APP_KEY,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ 
      prompt, 
      character
    })      
  });
  const data = await res?.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate post');  
  
  return data?.post ?? "";
}
