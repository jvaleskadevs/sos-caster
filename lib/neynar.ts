'use server';

export type CastResult = any;

export async function publishCast(
  cast: string, apikey: string, signer: string, channelId?: string, parentHash?: string
): Promise<CastResult | undefined> {
  const message = cast || '...---... ...---... ...---... ...---...\n' +
      '\n' +
      "Don't worry, it is a test SOS message. No one is in danger (here).\n" +
      'Ignore this message and have a good day/night.\n' +
      ' ...---... ...---... ...---... ...---...'
  ;

  const apiKey = apikey || process.env.NEYNAR_SOSCASTER_API_KEY;
  const signerUuid = signer || process.env.BOT_SIGNER_UUID;
  //const channelId = channel ?? process.env.CHANNEL_ID ?? '';

  if (!apiKey || !signerUuid) {
    console.error('Missing required API key and/or signer.');
    throw new Error('Invalid configuration error for publishing cast.');
    return undefined;
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
      channel_id: (channelId && !parentHash) ? channelId : undefined,
      parent: parentHash ?? undefined
    })
  };
  
  const endpoint = `https://api.neynar.com/v2/farcaster/cast`;

  try {  
    //console.log('Publishing cast with options:', JSON.stringify(options, null, 2));
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Neynar API Error:', response.status, errorBody);
      throw new Error(
      `Failed to publish cast: ${response.status}-${errorBody.message || 'Unknown error'}`);
      return undefined;
    }

    const result = await response.json();
    console.log('Cast published successfully:', result);
    return result;
  } catch (err) {
    console.error('Error publishing cast:', err);
    throw err;
  }
  return undefined;
}

export async function fetchCastByHash(hash: `0x${string}`, apikey: string, viewerFid?: number) {
  if (!hash) return undefined;  

  const endpoint = `https://api.neynar.com/v2/farcaster/cast/?type=hash&identifier=${hash}&viewer_fid=${viewerFid ?? 3}`;
  const options = {
    method: 'GET',
    headers: {
      'x-api-key': apikey || (process.env.NEYNAR_SOSCASTER_API_KEY || ""), 
      'x-neynar-experimental': 'false'
    },
    body: undefined
  };

  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Neynar API Error:', response.status, errorBody);
      throw new Error(
      `Failed to fetch cast: ${response.status}-${errorBody.message || 'Unknown error'}`);
      return undefined;
    }

    const data = await response.json();
    console.log('Cast fetched successfully:', data);
    return data?.cast ?? undefined;
  } catch (error) {
    console.error(error);
  }    
  return undefined;
}

export async function fetchCastRepliesByHash(hash: `0x${string}`, apikey: string, viewerFid?: number, cursor?: string) {
  if (!hash) return undefined;  
  
  const endpoint = `https://api.neynar.com/v2/farcaster/cast/conversation/?reply_depth=2&limit=20&type=hash&identifier=${hash}&viewer_fid=${viewerFid ?? 3}&sort_type=desc_chron${!!cursor && ('&cursor=' + cursor)}`;
  const options = {
    method: 'GET',
    headers: {
      'x-api-key': apikey || (process.env.NEYNAR_SOSCASTER_API_KEY || ""), 
      'x-neynar-experimental': 'false'
    },
    body: undefined
  }; 
  
  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Neynar API Error:', response.status, errorBody);
      throw new Error(
      `Failed to fetch cast conversation: ${response.status}-${errorBody.message || 'Unknown error'}`);
      return undefined;
    }

    const data = await response.json();
    console.log('Cast conversation fetched successfully:', data);
    return { conversation: data?.conversation ?? undefined, cursor: data?.cursor ?? "" };
  } catch (error) {
    console.error(error);
  }    
  return undefined;     
}

export async function fetchNeynarStatus() {
  const url = 'https://api.neynar.com/v2/farcaster/channel/search/?limit=1&q=farcaster';
  const options = {
    method: 'GET', 
    headers: {'x-api-key': process.env.NEYNAR_SOSCASTER_API_KEY || 'NEYNAR_API_DOCS'}, 
    body: undefined
  };

  try {
    const response = await fetch(url, options);
    //console.log(response);
    if (response.ok) return "online";
    return "offline";
  } catch (error) {
    console.error(error);
  }
  return "offline";
}
