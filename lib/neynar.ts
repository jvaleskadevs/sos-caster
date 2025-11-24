'use client';

export async function publishCast(cast: string, apikey: string, signer: string) {
  const message = cast || '...---... ...---... ...---... ...---...\n' +
      '\n' +
      "Don't worry, it is a test SOS message. No one is in danger (here).\n" +
      'Ignore this message and have a good day/night.\n' +
      ' ...---... ...---... ...---... ...---...'
  ;

  const apiKey = apikey || process.env.NEXT_PUBLIC_NEYNAR_SOSCASTER_API_KEY;
  const signerUuid = signer || process.env.BOT_SIGNER_UUID;
  //const channelId = channel ?? process.env.CHANNEL_ID ?? '';

  if (!apiKey || !signerUuid) {
    console.error('Missing required API key and/or signer.');
    throw new Error('Invalid configuration error for publishing cast.');
  }
  
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      api_key: apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      signer_uuid: signerUuid, 
      text: message,
      //embeds: [{url: frame}],
      //channel_id: channelId,
      //parent: '0xeff1dcc9575ccda19efc5e1dcc7457d253ca86fb'
    })
  };
  
  const endpoint = `https://api.neynar.com/v2/farcaster/cast`;

  try {  
    console.log('Publishing cast with options:', JSON.stringify(options, null, 2));
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Neynar API Error:', response.status, errorBody);
      throw new Error(
      `Failed to publish cast: ${response.status}-${errorBody.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('Cast published successfully:', result);
  } catch (err) {
    console.error('Error publishing cast:', err);
    throw err;
  }
}

export async function fetchNeynarStatus() {
  const url = 'https://api.neynar.com/v2/farcaster/channel/search/?limit=1&q=farcaster';
  const options = {method: 'GET', headers: {'x-api-key': 'NEYNAR_API_DOCS'}, body: undefined};

  try {
    const response = await fetch(url, options);
    console.log(response);
    if (response.ok) return "online";
    return "offline";
  } catch (error) {
    console.error(error);
  }
  return "offline";
}
