import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SiInstagram, SiTiktok, SiSpotify, SiApplemusic, SiYoutube } from "react-icons/si";
import { Music, Play, ExternalLink, Loader2 } from "lucide-react";
import PostFeed from "@/components/PostFeed";

const subscriptionSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      email: "",
    },
  });

  const subscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionForm) => {
      return apiRequest("POST", "/api/subscribe", data);
    },
    onSuccess: () => {
      setLocation("/thank-you");
    },
    onError: (error: Error) => {
      const message = error.message.includes("already subscribed") 
        ? "This email is already subscribed to our updates!"
        : "Something went wrong. Please try again.";
      
      toast({
        title: "Subscription Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionForm) => {
    subscriptionMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden bg-cream">




      {/* Main Content */}
      <div className="max-w-md sm:max-w-lg lg:max-w-xl w-full space-y-12 animate-slide-up px-4 sm:px-0" style={{animationDelay: '0.2s'}}>
        
        {/* Brand Header with Grace Photo */}
        <div className="text-center">
          <div className="mb-4 relative flex flex-col items-center">
            
            {/* Grace Photo */}
            <div className="mb-4">
              <img 
                src="/grace-photo.png" 
                alt="Grace - Artist and creator of Grace Period"
                className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full mx-auto object-cover shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
          
          <h1 className="font-black text-4xl sm:text-5xl md:text-6xl text-accent-red mb-6 tracking-wide leading-tight">
            GRACE PERIOD
          </h1>
          
          {/* Social Media Links */}
          <div className="mb-6">
            <div className="flex space-x-6 justify-center">
              <a 
                href="https://instagram.com/graceperiodmusic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon bg-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent-red/30 transition-all"
                aria-label="Follow Grace Period on Instagram"
              >
                <SiInstagram className="text-xl sm:text-2xl text-accent-red" />
              </a>
              <a 
                href="https://www.tiktok.com/@graceperiodmusic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon bg-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent-red/30 transition-all"
                aria-label="Follow Grace Period on TikTok"
              >
                <SiTiktok className="text-xl sm:text-2xl text-accent-red" />
              </a>
            </div>
          </div>
          
          {/* Full width horizontal line divider */}
          <div className="w-full max-w-xs sm:max-w-sm mx-auto h-0.5 bg-accent-red mt-8"></div>
        </div>



        {/* Subscription Form */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-light text-text-dark mb-3 tracking-wide">Stay connected</h2>
            <p className="text-text-dark opacity-70 text-base sm:text-lg font-light">Get notified about new releases and shows</p>
          </div>
          
          <div className="max-w-xs mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" role="form" aria-label="Email subscription form">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="w-full px-4 py-4 border border-gray-300 rounded-none bg-white text-text-dark text-base font-light focus:border-accent-red focus:outline-none transition-colors"
                          aria-label="Email address for updates"
                          aria-describedby="email-error"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-accent-red text-sm font-light" id="email-error" />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={subscriptionMutation.isPending}
                  className="w-full bg-accent-red text-white py-4 px-6 rounded-none font-light text-base tracking-wide hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-accent-red/30 disabled:opacity-50 transition-all uppercase"
                  aria-describedby={subscriptionMutation.isPending ? "loading-text" : undefined}
                >
                  {subscriptionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      <span id="loading-text">Subscribing...</span>
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Horizontal line separator */}
        <div className="w-full max-w-md mx-auto my-12">
          <hr className="border-t border-gray-300" />
        </div>

        {/* Posts feed */}
        <div className="w-full">
          <PostFeed />
        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 sm:mt-8 text-center animate-slide-up" style={{animationDelay: '0.4s'}}>
        <p className="text-text-dark opacity-60 text-xs sm:text-sm">
          © 2025 Grace Period. All rights reserved.
        </p>
      </div>

    </div>
  );
}
