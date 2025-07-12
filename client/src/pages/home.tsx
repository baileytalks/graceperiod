import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SiInstagram, SiTiktok, SiSpotify, SiApplemusic, SiYoutube } from "react-icons/si";
import { Music, Play, ExternalLink, Loader2, Mail, Pause, SkipBack, SkipForward } from "lucide-react";
import PostFeed from "@/components/PostFeed";
import gracePeriodImage1 from "@assets/grace-photo_1749643666415.png";
import gracePeriodImage2 from "@assets/IMG_7663.jpeg";
import musicBanner from "@assets/music_1749642724497.jpg";

const subscriptionSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  location: z.string().optional(),
});

const countries = [
  "United Kingdom",
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahrain", "Bangladesh", "Belarus", "Belgium", "Brazil", "Bulgaria",
  "Canada", "Chile", "China", "Colombia", "Croatia", "Cyprus", "Czech Republic",
  "Denmark", "Egypt", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon", "Lithuania",
  "Luxembourg", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Norway",
  "Pakistan", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Saudi Arabia", "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea",
  "Spain", "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
  "United States", "Vietnam"
];

type SubscriptionForm = z.infer<typeof subscriptionSchema>;

export default function Home() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<SubscriptionForm>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      email: "",
      location: "",
    },
  });

  // Fetch visitor count
  const { data: visitorData } = useQuery<{ count: number }>({
    queryKey: ['/api/visitor-count'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Increment visitor count once on component mount
  useEffect(() => {
    const incrementVisitor = async () => {
      try {
        await fetch("/api/visitor-count", { method: "POST" });
        queryClient.invalidateQueries({ queryKey: ['/api/visitor-count'] });
      } catch (error) {
        console.error("Failed to increment visitor count:", error);
      }
    };
    
    incrementVisitor();
  }, []); // Empty dependency array ensures this runs only once

  // Parallax scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      const banner = document.getElementById('parallax-banner');
      if (banner) {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        banner.style.transform = `translate3d(0, ${scrolled * parallaxSpeed}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const subscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionForm) => {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been added to our updates list.",
      });
      setLocation("/thank-you");
    },
    onError: (error: Error) => {
      toast({
        title: "Oops!",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionForm) => {
    subscriptionMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#f4f1de]">
      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-4 bg-[#3d405b]" style={{ fontFamily: 'Arial, sans-serif' }}>
        <div></div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-white">yourspace</h1>
          <p className="text-xs italic text-white/80">Stay as long as you need</p>
        </div>
      </header>

      {/* Main banner image with parallax effect - reduced height for above-fold content */}
      <div className="relative h-[40vh] -mt-16 overflow-hidden">
        <div 
          id="parallax-banner"
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url(${musicBanner})`,
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            transform: 'translate3d(0, 0, 0)',
            height: '60vh',
            top: '-10vh'
          }}
          role="img"
          aria-label="Grace Period performing on stage"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>
      
      {/* Profile photo positioned to overlap main content */}
      <div className="relative -mt-32 z-10 px-8 mb-2">
        <div className="w-48 h-48 bg-[#f4f1de] rounded-lg shadow-xl border-4 border-[#f4f1de] overflow-hidden">
          <img 
            src={gracePeriodImage1}
            alt="Grace Period profile photo - Singer/Songwriter from London"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Profile Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-3xl font-bold text-[#e22a43] mb-2" aria-label="Grace Period, artist name">GRACE PERIOD</h2>
              <p className="text-sm text-[#3d405b] mb-1 font-bold" aria-label="Musical genre">Singer/Songwriter</p>
              <p className="text-sm text-[#3d405b] mb-4 font-bold" aria-label="Location">London, United Kingdom</p>
              <div className="mb-4" aria-label="Total profile views">
                <span className="text-sm text-[#3d405b] mr-2">Profile Views:</span>
                <span className="inline-block bg-[#3d405b] text-[#f4f1de] px-2 py-1 font-mono text-sm tracking-wider border border-[#e22a43]" style={{ fontFamily: 'monospace' }}>
                  {visitorData?.count?.toLocaleString() || '...'}
                </span>
              </div>
            </div>

          {/* Sign up section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-bold text-[#3d405b] mb-3 text-base">Sign up for news on new releases, gigs and more</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter Email"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:border-[#e22a43] focus:outline-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[#e22a43] text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full text-sm focus:border-[#e22a43]">
                            <SelectValue placeholder="Select your location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[#e22a43] text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={subscriptionMutation.isPending}
                  className="w-full bg-[#3d405b] text-white py-2 px-4 rounded text-sm hover:bg-gray-700 disabled:opacity-50"
                >
                  {subscriptionMutation.isPending ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Subscribe
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Stay connected */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="bg-[#3d405b] text-white p-3 font-bold text-sm rounded-t-lg">Stay connected</h3>
            <div className="p-4 space-y-3 text-sm">

              <div className="flex items-center space-x-3">
                <SiTiktok className="w-4 h-4 text-[#3d405b]" />
                <a href="https://www.tiktok.com/@graceperiodmusic" className="text-[#3d405b] hover:underline">
                  Follow me on TikTok
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <SiInstagram className="w-4 h-4 text-[#3d405b]" />
                <a href="https://instagram.com/graceperiodmusic" className="text-[#3d405b] hover:underline">
                  Follow me on Instagram
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-[#3d405b]" />
                <a 
                  href="mailto:graceperiodartist@gmail.com"
                  className="text-[#3d405b] hover:underline"
                >
                  Send me an email
                </a>
              </div>
            </div>
          </div>

          {/* Status and Mood */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="bg-[#e22a43] text-white p-3 font-bold text-sm rounded-t-lg">Status and Mood</h3>
            <div className="p-4 text-sm">
              <p className="text-[#3d405b] mb-2">
                <strong>Grace is working late into the night.</strong>
              </p>
              <p className="text-[#3d405b]">Mood: (none)</p>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* About Grace Period */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="border-b border-gray-200 p-4 font-bold text-[#3d405b]">About Grace Period</h3>
            <div className="p-4 text-sm text-[#3d405b] leading-relaxed">
              <p className="mb-3">
                Grace Period is a singer/songwriter based in North London.
              </p>
              <p className="mb-3">
                In her 20s, she wrote the kind of songs that she thought would help get her signed. Now in her late 30s, she writes the songs she needs for herself; songs about existing in a body under pressure. She's unapologetically older, wiser, and no longer waiting for permission.
              </p>
              <p className="mb-3">
                The result is a kind of modern protest music: often political in its subject matter, soulful in its delivery, and deeply intimate in tone. Grace Period gives voice to the experiences often left out of pop narratives – mid-life fertility clocks, long term relationships, feminine rage, body politics.
              </p>
              <p className="mb-3">
                Her sound draws from the soulful 70s melodies of <span className="font-bold text-[#e22a43]">Carole King</span>, crossed with the lyrical attitude of <span className="font-bold text-[#e22a43]">Self Esteem</span> and <span className="font-bold text-[#e22a43]">CMAT</span>. It's bluesy, lyrical, and a little theatrical.
              </p>
              <p className="mb-3">
                Grace knows what it's like to wait too long and then decide: no more waiting. Maybe you do too.
              </p>
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-[#3d405b] mb-3 bg-gray-50 py-2">
                "It felt as if she was sharing a voice that has always existed within. It made me feel like this voice exists within me too."
              </blockquote>
              <p>
                Maybe you need your own grace period. Let it give you an extension; a delay, a mercy. A stretch of time between what you thought you wanted and what you might still become. Breathe; welcome. Stay a while.
              </p>
            </div>
          </div>

          {/* Currently playing - Spotify-style */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="border-b border-gray-200 p-4 font-bold text-[#3d405b]">Currently playing</h3>
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg p-4 opacity-75">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 bg-gray-300 rounded"></div>
                  <div>
                    <p className="font-medium text-gray-500">Grace Period</p>
                    <p className="text-sm text-gray-400">Coming Soon</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 mb-2">
                  <SkipBack className="w-4 h-4 text-gray-400" />
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-gray-500 ml-0.5" />
                  </div>
                  <SkipForward className="w-4 h-4 text-gray-400" />
                </div>
                <div className="w-full bg-gray-300 rounded-full h-1">
                  <div className="bg-gray-400 h-1 rounded-full w-0"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0:00</span>
                  <span>--:--</span>
                </div>
              </div>
            </div>
          </div>

          {/* Latest */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="border-b border-gray-200 p-4 font-bold text-[#3d405b]">Latest</h3>
            <div className="p-4">
              <PostFeed />
            </div>
          </div>

        </div>
      </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 p-4 text-center text-xs text-white bg-[#3d405b]" style={{ fontFamily: 'Arial, sans-serif' }}>
        <p role="contentinfo">© 2025 Grace Period. All rights reserved.</p>
      </footer>

    </div>
  );
}