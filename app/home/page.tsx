"use client"
 
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { useNeynarContext } from "@neynar/react";
import { CastResult, fetchNeynarStatus, publishCast } from "@/lib/neynar";
import { Heart } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RecentCasts } from '@/components/RecentCasts';
import { ServiceStatus } from '@/components/ServiceStatus';
import { Footer } from "@/components/Footer";

const STORAGE_KEY = 'sos-cast-storage';
const CASTS_STORAGE_KEY = 'soscaster-casts';
const allowSaveCasts = true;

const SendCastFormSchema = z.object({
  cast: z
    .string()
    .min(1, {
      message: "Cast must be at least 1 character.",
    })
    .max(1024, {
      message: "Cast must not be longer than 1024 characters.",
    }),
  channel: z.
    string()
    .min(1, {
      message: "Invalid channel name"
    })
    .max(150, {
      message: "Invalid channel name"
    }).optional().default("none"),
})

type ServiceStatusType = "online" | "offline" | "maintenance" | "degraded";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [neynarStatus, setNeynarStatus] = useState<ServiceStatusType>("offline");
  const [farcasterStatus, setFarcasterStatus] = useState<ServiceStatusType>("offline");
  const [recentCasts, setRecentCasts] = useState<CastResult[]>([]);
  const [userSigner, setUserSigner] = useState<string>("");
  const [userApiKey, setUserApiKey] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const parentHash = searchParams.get("parent");

  const { user } = useNeynarContext();
  
  const form = useForm<z.infer<typeof SendCastFormSchema>>({
    resolver: zodResolver(SendCastFormSchema),
    defaultValues: {
      cast: "",
      channel: "none"
    }
  });
  const error = false;

  useEffect(() => {
    try {
      const storageItem = localStorage.getItem(STORAGE_KEY);
      if (storageItem) {
        const storedData = JSON.parse(storageItem);
        if (storedData?.signer) setUserSigner(storedData.signer);
        if (storedData?.apikey) setUserApiKey(storedData.apikey);
      } 
      if (!storageItem && (!user || !user?.signer_uuid)) router.push("/login");
      const castsStorageItem = localStorage.getItem(CASTS_STORAGE_KEY);
      if (castsStorageItem) {
        const storedCasts = JSON.parse(castsStorageItem);
        if (storedCasts?.casts && storedCasts.casts.length > 0) setRecentCasts(storedCasts.casts);
      }
    } catch (error) {
      console.error("Failed to read data from localStorage:", error);
    }
    async function fetchStatus() {
      try {
        const status = await fetchNeynarStatus();
        if (status) setNeynarStatus(status as ServiceStatusType);
      } catch (error) {
         console.error("Failed to read data from neynar:", error);
         setNeynarStatus("offline");
      }
    }
    fetchStatus();
  }, []);
  
  async function onSubmit(data: z.infer<typeof SendCastFormSchema>) {
    setIsSubmitting(true);

    try {
      const castResult = await publishCast(
        data.cast, 
        userApiKey || "", 
        user?.signer_uuid || (userSigner || ""),
        data.channel !== "none" ? (data.channel || "") : "",
        parentHash || "",
      );
      toast({
        title: "SOS Cast submitted successfully!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{data.cast.substring(0, 42)}...</code>
          </pre>
        ),
      });

      if (allowSaveCasts) {
        try {
          localStorage.setItem(
            CASTS_STORAGE_KEY, 
            JSON.stringify({ 
              casts: [...recentCasts, castResult]
            })
          );
        } catch (error) {
          console.error("Failed to save cast to localStorage:", error);
        }
      }
      
      form.resetField("cast");
      setRecentCasts(prev => [...prev, castResult]);
    } catch (err) {
      console.error("Failed to submit cast:", error);
      toast({
        title: "SOS Cast failed",
        description: "Something was wrong. Try again.",
        variant: "destructive"
      });      
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (!user && !userSigner) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] flex items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <div className="flex flex-row gap-4 row-start-2 items-center">
          {/*
          <Image
            className="dark:invert"
            src="anon_mask.svg"
            alt="Next.js logo"
            width={90}
            height={90}
            priority
          />
          */}
          <h1 className="text-5xl w-full text-center font-semibold">SOS CASTER</h1>
          <ThemeToggle />
        </div>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by setting a signer or signing with neynar.
          </li>
          <li>Then, type and press send cast to send your{" "}          
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              SOS message
            </code>.</li>
        </ol>
 
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="w-full space-y-6"
          >
          { !parentHash && 
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a valid channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/*<SelectItem value="soscaster">soscaster</SelectItem>*/}
                    <SelectItem value="none">Select a valid channel</SelectItem>
                    <SelectItem value="onchain-blocks">onchain-blocks</SelectItem>
                    <SelectItem value="base">base</SelectItem>
                    <SelectItem value="farcaster">farcaster</SelectItem>
                    <SelectItem value="neynar">neynar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> }
          <FormField
            control={form.control}
            name="cast"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    maxLength={1024} 
                    rows={11} 
                    placeholder="Type your SOS emergency message..."
                    className="md:min-w-[600px]"
                    {...field}
                  /> 
                </FormControl>
                {/*<FormDescription>
                  You can <span>@mention</span> other users and organizations.
                </FormDescription>*/}
                <FormMessage />
              </FormItem>
            )}
          />
          { error && <p className="text-sm text-muted-foreground">{error}</p> }
          <div className="flex gap-4 items-center flex-col sm:flex-row w-full">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full font-semibold"
            >
              { isSubmitting ? "Sending..." : "SEND SOS CAST"}
            </Button>
          </div>  

          <div className="w-full flex gap-4 sm:gap-6 justify-center items-center mb-8">
            <ServiceStatus service={"Neynar Status"} status={neynarStatus || "offline"} />
            <ServiceStatus service={"Farcaster Status"} status={farcasterStatus || "offline"} />
          </div>
         </form>
        </Form>
        
        <RecentCasts casts={recentCasts} />
        
      </main>
      <Footer />
    </div>
  );
}
