"use client"
 
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import { fetchNeynarStatus, publishCast } from "@/lib/neynar";
import { Heart } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { NeynarAuthButton, useNeynarContext } from "@neynar/react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
/*
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
*/
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; 
import { ThemeToggle } from "@/components/ThemeToggle";
import { ServiceStatus } from '@/components/ServiceStatus';

const STORAGE_KEY = 'sos-cast-storage';

const ForwardedInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ ...props }, ref) => (
  <Input ref={ref} {...props} />
));
ForwardedInput.displayName = "ForwardedInput";

const FormSchema = z.object({
  cast: z
    .string()
    .min(1, {
      message: "Cast must be at least 1 character.",
    })
    .max(1024, {
      message: "Cast must not be longer than 1024 characters.",
    }),
/*
  channel: z.
    string()
    .min(1, {
      message: "Invalid channel name"
    })
    .max(150, {
      message: "Invalid channel name"
    }),
*/
  apikey: z.
    string()
    .min(36, {
      message: "Invalid api key"
    })
    .max(36, {
      message: "Invalid api key"
    })
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { 
       message: "Invalid UUID format." 
    }),
  signer: z.
    string()
    .min(36, {
      message: "Invalid signer"
    })
    .max(36, {
      message: "Invalid signer"
    })
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { 
       message: "Invalid UUID format." 
    }),
  allowSavePrefs: z.boolean().default(false)
})

const UserFormSchema = z.object({
  cast: z
    .string()
    .min(1, {
      message: "Cast must be at least 1 character.",
    })
    .max(1024, {
      message: "Cast must not be longer than 1024 characters.",
    })
})


type ServiceStatusType = "online" | "offline" | "maintenance" | "degraded";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSignerField, setShowSignerField] = useState<boolean>(true);
  const [neynarStatus, setNeynarStatus] = useState<ServiceStatusType>("offline");
  const [farcasterStatus, setFarcasterStatus] = useState<ServiceStatusType>("offline");

  const { user } = useNeynarContext();
  
  const form = useForm<z.infer<typeof FormSchema> & z.infer<typeof UserFormSchema>>({
    resolver: zodResolver(user !== null ? UserFormSchema : FormSchema),
    defaultValues: {
      cast: "",
      apikey: "",
      signer: "",
      allowSavePrefs: false
    }
  });
  const error = false;

  useEffect(() => {
    try {
      const storageItem = localStorage.getItem(STORAGE_KEY);
      if (storageItem) {
        const storedData = JSON.parse(storageItem);
        form.setValue('signer', storedData?.signer || '', { shouldValidate: true });
        form.setValue('apikey', storedData?.apikey || '', { shouldValidate: true });
        form.setValue('allowSavePrefs', !!storedData?.allowSavePrefs, { shouldValidate: true });
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

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    
    try {
      await publishCast(data.cast, data.apikey, data.signer);
      toast({
        title: "SOS Cast submitted successfully!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{data.cast.substring(0, 42)}...</code>
          </pre>
        ),
      });
      
      if (data.allowSavePrefs) {
        try {
          localStorage.setItem(
            STORAGE_KEY, 
            JSON.stringify({ 
              signer: data.signer, apikey: data.apikey, allowSavePrefs: data.allowSavePrefs 
            })
          );
        } catch (error) {
          console.error("Failed to save signer to localStorage:", error);
        }
      }
      
      form.resetField("cast");
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
  
  async function onSubmitWithUser(data: z.infer<typeof UserFormSchema>) {
    setIsSubmitting(true);

    try {
      await publishCast(data.cast, "", user?.signer_uuid || "");
      toast({
        title: "SOS Cast submitted successfully!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{data.cast.substring(0, 42)}...</code>
          </pre>
        ),
      });
      
      form.resetField("cast");
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

  return (
    <div className="grid grid-rows-[20px_1fr_20px] flex items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
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
          <h1 className="text-5xl w-full text-center">...---... SOS CASTER</h1>
          <ThemeToggle />
        </div>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by setting your neynar apikey and signer.
          </li>
          <li>Then, type and press send cast to send your{" "}          
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              SOS message
            </code>.</li>
        </ol>
 
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(user !== null ? onSubmitWithUser : onSubmit)} 
            className="w-full space-y-6"
          >
          {/*
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
                    <SelectItem value="onchain-blocks">onchain-blocks</SelectItem>
                    <SelectItem value="base">base</SelectItem>
                    <SelectItem value="farcaster">farcaster</SelectItem>
                    <SelectItem value="neynar">neynar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />*/}
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
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full"
            > {/*
              <Image
                className="invert"
                src="anon_mask.svg"
                alt="anon mask logo"
                width={74}
                height={74}
              />*/}
              { isSubmitting ? "Sending..." : "SEND SOS CAST"}
            </Button>
  {/*
            <a
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read our docs
            </a>
            */}
          </div>  

        <div className="w-full flex gap-4 sm:gap-6 justify-center items-center mb-8">
          <ServiceStatus service={"Neynar Status"} status={neynarStatus || "offline"} />
          <ServiceStatus service={"Farcaster Status"} status={farcasterStatus || "offline"} />
        </div>

          <div className="min-h-[440] relative space-y-4">
            <p 
              onClick={() => setShowSignerField(prev => !prev)}
              className="w-full text-center text-xs cursor-pointer"
            >
              <u>{showSignerField ? 'Hide ' : 'Show '} signer settings</u>
            </p>

          { showSignerField && 
            <FormField
              control={form.control}
              name="apikey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neynar Api Key</FormLabel>
                  <FormControl>
                    <ForwardedInput 
                      maxLength={36} 
                      placeholder="10c46a86-0809-4c87-b477-e13a5527119b"
                      {...field}
                    /> 
                  </FormControl>                
                  <FormMessage />
                </FormItem>
              )}
            />}   
            { showSignerField && 
            <FormField
              control={form.control}
              name="signer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Neynar Signer</FormLabel>
                  <FormControl>
                    <ForwardedInput 
                      maxLength={36} 
                      placeholder="c7dc19cf-d72c-45c9-8c16-cc16a36ffe1e"
                      {...field}
                    /> 
                  </FormControl>                
                  <FormMessage />
                   <p className="w-full text-muted-foreground text-center text-xs cursor-pointer">
                    <a 
                      //className="hover:underline hover:underline-offset-4"
                      href="https://neynar.com/"
                      target="_blank"
                      rel="noopener noreferrer"                        
                    >
                      <u>Get your Neynar api key and signer</u>
                    </a>
                  </p>
                </FormItem>
              )}
            />}  
            { showSignerField && 
            <FormField
              control={form.control}
              name="allowSavePrefs"
              render={({ field }) => (
                <FormItem 
                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Remember Me
                    </FormLabel>
                     <FormDescription>
                      Save your preferences in browser for next time.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />}
            
           { showSignerField && 
            <div className="w-full flex flex-col gap-6 items-center justify-center">         
              <p className="w-full text-muted-foreground text-center opacity-[.8]">
                OR
              </p> 
              <NeynarAuthButton />
            </div> }
           </div>          
          </form>
        </Form>
        
      </main>
      <div className="row-start-3 flex flex-col gap-4 text-xs sm:text-sm md:text-md">
        <footer className="row-start-3 flex gap-6 pt-16 flex-wrap items-center justify-center font-[family-name:var(--font-geist-mono)]">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/jvaleskadevs/sos-caster"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/*
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />*/}
            Github →
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://join.base.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
          {/*
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />*/}
            TBA →
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://farcaster.xyz/~/channel/farcaster"
            target="_blank"
            rel="noopener noreferrer"
          >
          {/*
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />*/}
            Farcaster →
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://neynar.com"
            target="_blank"
            rel="noopener noreferrer"
          >
          {/*
            <Image
              aria-hidden
              src="https://nextjs.org/icons/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />*/}
            Neynar →
          </a>
        </footer>
        <p className="w-full text-muted-foreground text-center opacity-[.8] mt-2">
          Made with 💜️ by <span><a
            className="hover:underline hover:underline-offset-4"
            href="https://farcaster.xyz/jvaleska.eth"
            target="_blank"
            rel="noopener noreferrer"
          >J.Valeska</a></span>
        </p>
      </div>
    </div>
  );
}
