"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useNeynarContext } from "@neynar/react";
import { fetchCastByHash} from "@/lib/neynar";
import { ThemeToggle } from "@/components/ThemeToggle";

const STORAGE_KEY = 'sos-cast-storage';

export default function Cast() {
  const [cast, setCast] = useState<any>(null);
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
        const castData = await fetchCastByHash(hash, userApiKey || "", user?.fid);
        console.log(castData);
        setCast(castData);
      } catch (error) {
        console.error("Failed to fetch cast:", error);
        setError("Failed to load cast");
      } finally {
        setLoading(false);
      }
    }
    if (hash && !cast) fetchCast();
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
  
  if (!cast) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-muted-foreground">Cast not found</div>
      </div>
    );
  }
  
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
  <div className="w-full flex min-h-screen p-8 pb-20 sm:p-20">
    <main className="flex flex-col gap-8 items-center w-full">
      <div className="flex flex-row gap-4 items-center">         
        <h1 className="text-5xl 2xl:text-7xl w-full text-center font-semibold mb-6">SOS CASTER</h1>
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[600px] mx-auto">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          {/* Author section */}
          <div className="flex items-start space-x-3 mb-4">
            <img
              src={cast.author.pfp_url}
              alt={cast.author.display_name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">
                  {cast.author.display_name}
                </h3>
                <span className="text-muted-foreground">
                  @{cast.author.username}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatTimestamp(cast.timestamp)}
              </p>
            </div>
          {/* Channel if present */}
          {cast.channel && (
            <div className="mb-4">
              <div className="hidden sm:inline-flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
                <img
                  src={cast.channel.image_url}
                  alt={cast.channel.name}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-sm font-medium">
                  {cast.channel.name}
                </span>
              </div>
            </div>
          )}

          </div>

          {/* Channel if present */}
          {cast.channel && (
            <div className="mb-4">
              <div className="inline-flex sm:hidden items-center space-x-2 bg-muted px-3 py-1 rounded-full">
                <img
                  src={cast.channel.image_url}
                  alt={cast.channel.name}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-sm font-medium">
                  {cast.channel.name}
                </span>
              </div>
            </div>
          )}

          {/* Cast message */}
          <div className="mb-4 text-foreground whitespace-pre-wrap">
            {cast.text}
          </div>

          {/* Embeds if present */}
          {cast.embeds && cast.embeds.length > 0 && (
            <div className="mb-4 space-y-2">
              {cast.embeds.map((embed: any, index: number) => (
                <div key={index} className="bg-muted rounded-lg p-3">
                  {embed.cast && (
                    <div className="text-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={embed.cast.author.pfp_url}
                          alt={embed.cast.author.display_name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="font-medium">
                          {embed.cast.author.display_name}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        {embed.cast.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions section */}
          <div className="flex items-center space-x-6 pt-4 border-t border-border">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <span className="text-sm">
                {cast.replies?.count || 0} replies
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <span className="text-sm">
                {cast.reactions?.likes_count || 0} likes
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <span className="text-sm">
                {cast.reactions?.recasts_count || 0} recasts
              </span>
            </div>
          </div>

          {/* Parent cast if this is a reply */}
          {cast.parent_hash && cast.parent_author && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground mb-2">
                Replying to @{cast.parent_author.username}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
  );
}
