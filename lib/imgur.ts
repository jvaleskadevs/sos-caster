"use server";

export async function uploadToImgur(image: string): Promise<string> {
  if (!image) return ""; 
  
  const endpoint = "https://api.imgur.com/3/image";
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
    },
    body: new URLSearchParams({
      image,
      type: image.startsWith("http") ? "url" : "base64",
      title: "my-img-"+Math.floor(Math.random() * 9999999),
      description: "my-img-desc"
    })
  }
  
  try {
    const response = await fetch(endpoint, options);

    const data = await response.json();
    
    if (data?.success) {
      //console.log('Imgur: image uploaded successfully');
      //console.log(data?.data?.link);
      return data?.data?.link ?? "";
    } else {
      console.error('Imgur: Error uploading image')
      return "";
    }
  } catch (err) {
    console.log(err);
  }
  return "";
}
