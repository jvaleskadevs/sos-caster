"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; 

const STORAGE_KEY = 'sos-cast-storage';

const ForwardedInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ ...props }, ref) => (
  <Input ref={ref} {...props} />
));
ForwardedInput.displayName = "ForwardedInput";

const FormSchema = z.object({
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

export default function SignIn() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const router = useRouter()
  const { user } = useNeynarContext();
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
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
  }, []);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    
    try {
      toast({
        title: "Welcome to SOS Caster!",
        description: "Signer connected successfully!",
      });
      
      if (data.signer && data.apikey) {
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
        router.push("/home");
        return;
      }
    } catch (err) {
      console.error("Failed to connect signer:", error);     
    } finally {
      setIsSubmitting(false);
    }
    toast({
      title: "Connection failed",
      description: "Something was wrong. Please, try again.",
      variant: "destructive"
    }); 
  }
  
  async function onSubmitWithUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) return;

    toast({
      title: `Welcome to SOS Caster, @${user?.username}!`,
      description: "Signer connected successfully!",
    });
    
    router.push("/home");
  }  
  
  return (
    <Form {...form}>
      <form 
        onSubmit={user !== null ? (e) => onSubmitWithUser(e) : form.handleSubmit(onSubmit)} 
        className="w-full"
      >
        <div className="min-h-[440] relative space-y-6">
          <div className="w-full flex flex-col gap-8 items-center justify-center">         
           <NeynarAuthButton />
            <p className="w-full text-muted-foreground text-center opacity-[.8]">
              OR
            </p> 
          </div> 

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
          />
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
          />
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
                    Save your signer in the browser for next time.
                  </FormDescription>
                </div>
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
            { isSubmitting ? "Connecting..." : "Connect"}
          </Button>
        </div>             
       </div>          
      </form>
    </Form>  
  );
}
