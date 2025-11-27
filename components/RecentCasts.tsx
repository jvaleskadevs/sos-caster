import { useRouter } from "next/navigation";
import { CastResult } from "@/lib/neynar";
//import { CheckCheck, X } from 'lucide-react';
import { CastItem } from "@/components/CastItem";

/*
const CastItem = ({ cast }: { cast: CastResult }) => {
  const router = useRouter();
  return (
    <div 
      className="rounded-md border shadow-xs px-4 py-4 w-full max-w-[600px]"
      onClick={() => router.push("/cast/"+cast?.cast?.hash)}
    >
      <p className="mb-1">
        {cast?.cast?.text}
      </p>
      <div className="text-muted-foreground flex flex-row gap-2">
        {cast?.success ? <CheckCheck /> : <X />} 
        SOS message sent from <span><a
            className="hover:underline hover:underline-offset-4"
            href={`https://farcaster.xyz/${cast?.cast?.author?.username}`}
            target="_blank"
            rel="noopener noreferrer"
          >@{cast?.cast?.author?.username}</a></span>
      </div>
    </div>
  );
}
*/

export const RecentCasts = ({ casts }: { casts: CastResult[] }) => {
  const router = useRouter();
  return (
    <div className="w-full flex flex-col justify-center items-center mb-12 space-y-4">
      { casts.length > 0 &&
      <h3 className="text-start w-full mb-4">
        Recent Casts
      </h3>}
      { (casts ?? []).map((cast: CastResult, i: number) => (
        <CastItem 
          key={i} 
          castData={cast?.cast} 
          onClick={() => router.push("/cast/"+cast?.cast?.hash)} 
        />
      ))}
    </div>
  );
}
