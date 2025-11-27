"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useNeynarContext } from "@neynar/react";
import { fetchCastRepliesByHash} from "@/lib/neynar";
import { CastItem } from "@/components/CastItem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

const STORAGE_KEY = 'sos-cast-storage';

export default function Cast() {
  const [castData, setCastData] = useState<any>(null);
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
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

  useEffect(() => {
    async function fetchCast() {
      setLoading(true);
      try {
        console.log("fetching hash:", hash);
        const castData = await fetchCastRepliesByHash(hash, userApiKey || "", user?.fid);
        console.log(castData);
        setCastData(castData);
      } catch (error) {
        console.error("Failed to fetch cast:", error);
        setError("Failed to load cast");
      } finally {
        setLoading(false);
      }
    }
    if (hash && !castData) fetchCast();
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
                  <CastItem key={reply.hash} castData={reply} isReply={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
