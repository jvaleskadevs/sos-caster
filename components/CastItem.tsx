import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareReply } from "lucide-react";

export const CastItem = ({ 
  castData, isReply = false, isReplyOfReply = false, onClick = () => {} 
}: { castData: any; isReply?: boolean, isReplyOfReply?: boolean, onClick?: () => void }) => {
  const router = useRouter();
  
  const [fetchedMoreReplies, setFetchedMoreReplies] = useState<boolean>(false);
  
  const formatTimestamp = (timestamp: string) => {
    return (timestamp ? new Date(timestamp) : new Date()).toLocaleString();
  };
  
  const handleFetchMoreReplies = () => {
    if (!castData.direct_replies || castData.direct_replies.length === 0 && !fetchedMoreReplies) {
      /// TODO fetch more replies !?
    }
    setFetchedMoreReplies(true);
  }

  return ( 
    <div 
      className={`w-full bg-card rounded-lg shadow-sm border border-border cursor-pointer p-6 ${isReplyOfReply ? 'ml-6 mt-6' : ''}`} 
      onClick={onClick}
    >
      {/* Author section */}
      <div className="flex items-start space-x-3 mb-4">
        <img
          src={castData.author.pfp_url}
          alt={castData.author.display_name}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-foreground">
              {castData.author.display_name}
            </h3>
            <span className="text-muted-foreground">
              <a
                className="hover:underline hover:underline-offset-4"
                href={`https://farcaster.xyz/${castData.author.username}`}
                target="_blank"
                rel="noopener noreferrer"
              >@{castData.author.username}</a>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatTimestamp(castData.timestamp)}
          </p>
        </div>
      </div>

      {/* Channel if present and it is not a reply */}
      {(castData.channel && !isReply && !isReplyOfReply) && (
        <div className="mb-4">
          <div className="inline-flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
            <img
              src={castData.channel.image_url}
              alt={castData.channel.name}
              className="w-4 h-4 rounded-full"
            />
            <span className="text-sm font-medium">
              {castData.channel.name}
            </span>
          </div>
        </div>
      )}

      {/* Cast message */}
      <div className="mb-4 text-foreground whitespace-pre-wrap">
        {castData.text}
      </div>

      {/* Embeds if present */}
      {castData.embeds && castData.embeds.length > 0 && (
        <div className="mb-4 space-y-2">
          {castData.embeds.map((embed: any, index: number) => (
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
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <span className="text-sm">
              {castData.replies?.count || 0} replies
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground">
            <span className="text-sm">
              {castData.reactions?.likes_count || 0} likes
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground">
            <span className="text-sm">
              {castData.reactions?.recasts_count || 0} recasts
            </span>
          </div>
        </div>
        {/* Reply button */}
        {!isReplyOfReply &&
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/home?parent=${castData.hash}`)}}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <MessageSquareReply />          
        </button>}
      </div>

      {/* Parent cast if this is a reply */}
      {/*
      {(castData.parent_hash && castData.parent_author && (isReply || isReplyOfReply)) && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Replying to @{castData.parent_author.fid}
          </div>
        </div>
      )}*/}
    </div>
  );
}
