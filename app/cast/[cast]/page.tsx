"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useNeynarContext } from "@neynar/react";
import { fetchCastRepliesByHash} from "@/lib/neynar";
import { CastItem } from "@/components/CastItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

const STORAGE_KEY = 'sos-cast-storage';

export default function Cast() {
  const [castData, setCastData] = useState<any>(null);
  const [repliesCursor, setRepliesCursor] = useState<string>("");
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  const params = useParams();
  const hash = params.cast as `0x${string}`;

  const { user } = useNeynarContext();

  useEffect(() => {
    try {
      const storageItem = localStorage.getItem(STORAGE_KEY);
      if (storageItem) {
        const storedData = JSON.parse(storageItem);
        if (storedData?.apikey) setUserApiKey(storedData.apikey);
      }
    } catch (error) {
      console.error("Failed to read data from localStorage:", error);
    }
  }, []);

  async function fetchCastWithReplies() {
    if (loading || !hash || (castData && !repliesCursor)) return;
    console.log(castData);
    console.log(repliesCursor);
    
    setLoading(true);
    try {
      console.log("Fetching cast with hash:", hash);
      console.log(repliesCursor);
      const castData = await fetchCastRepliesByHash(hash, userApiKey || "", user?.fid, repliesCursor);
      console.log("Fetched cast:", castData);
      if (castData?.conversation && castData?.conversation?.cast) {
        setCastData((prev: any) => {
          if (!prev) {
            return castData.conversation;
          }
          
          const existingReplies = prev?.cast?.direct_replies ?? [];
          const newReplies = castData?.conversation?.cast?.direct_replies ?? [];
          const repliesMap = new Map();
          
          existingReplies.forEach((reply: any) => {
            repliesMap.set(reply.hash, reply);
          });
          newReplies.forEach((reply: any) => {
            repliesMap.set(reply.hash, reply);
          });

          return {
            cast: {  
              ...(castData.conversation.cast), 
              direct_replies: Array.from(repliesMap.values())
            } 
          };
        setRepliesCursor(castData?.cursor || "");
      })};
    } catch (error) {
      console.error("Failed to fetch cast:", error);
      setError("Failed to load cast");
    } finally {
      setLoading(false);
    }
  }

  // initial fetch
  useEffect(() => {
    if (hash && !castData && !loading) fetchCastWithReplies();
  }, [hash]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }
  
  if (!castData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-muted-foreground">Cast not found</div>
      </div>
    );
  }
  
  return (
    <div className="w-full flex flex-col min-h-screen p-8 pb-20 sm:p-20">
      <main className="flex flex-col gap-8 items-center w-full">
        <div className="flex flex-row gap-4 items-center">         
          <h1 className="text-5xl 2xl:text-7xl w-full text-center font-semibold mb-6">SOS CASTER</h1>
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[600px] mx-auto">
          {/* Main cast */}
          <CastItem castData={castData.cast} />

          {/* Replies section */}
          {castData?.cast?.direct_replies && castData.cast.direct_replies.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4 text-foreground">
                {castData?.cast?.replies?.count || "No"} replies to your SOS message
              </h2>
              <div className="space-y-4">
                {castData.cast.direct_replies.map((reply: any) => (
                  <div key={reply.hash} className="space-y-4">
                    <CastItem key={reply.hash} castData={reply} isReply={true} />
                    {reply?.direct_replies && reply.direct_replies.length > 0 && (
                      reply.direct_replies.map((replyOfReply: any) => (
                        <CastItem key={replyOfReply.hash} castData={replyOfReply} isReplyOfReply={true} />
                      )))}
                    <hr className="mr-[6]" />
                  </div>
                ))}
              </div>
              { (castData?.cast?.replies?.count > 0 && repliesCursor) &&
              <Button
                onClick={() => fetchCastWithReplies()}
                className="text-muted-foreground bg-transparent hover:bg-transparent hover:underline"
              >
                See more replies
              </Button>}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
