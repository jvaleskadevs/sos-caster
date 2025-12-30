import { NextRequest, NextResponse } from "next/server";
//import { headers } from "next/headers";
//import { APP_KEY } from "@/config";
import { generateImage } from "@/lib/generateImage";

export async function POST(req: NextRequest) {
  const {
    igenParams,
    uploadImage
  } = await req?.json();
  //console.log("igenParams", igenParams);
  /*
  const appKey = (await headers()).get('authorization');
  if (appKey !== APP_KEY) return NextResponse.json(
    { error: "IGEN: Missing API Key" }, 
    { status: 403 }
  );
  */
                                     
  if (!igenParams) return NextResponse.json(
    { error: "IGEN: Invalid/Missing Params" }, 
    { status: 400 }
  );
  
  try {
    const image = await generateImage({ 
      ...igenParams, 
      uploadImage: uploadImage ?? undefined 
    });
    //console.log(image);

    if (!image) return NextResponse.json(
      { error: "IGEN: Invalid/Missing Image" }, 
      { status: 400 }
    );
    
    return NextResponse.json({
      image: `data:image/png;base64,${image}`
    });
  } catch (err) {
    console.log(err);
  }
  
  return NextResponse.json(
    { error: "IGEN: Something went wrong" }, 
    { status: 500 }
  );
}
