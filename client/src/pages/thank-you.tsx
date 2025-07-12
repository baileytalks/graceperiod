import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Music, Mail, Users } from "lucide-react";
import { SiInstagram, SiTiktok } from "react-icons/si";

export default function ThankYou() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-[#f4f1de] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <h1 className="text-3xl font-bold text-[#e22a43] mb-6">Thank you for signing up</h1>
          
          {/* What's Next Section */}
          <div className="text-left mb-6">
            <h2 className="text-lg font-bold text-[#3d405b] mb-3">What's Next?</h2>
            <ul className="space-y-2 text-sm text-[#3d405b]">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-[#e22a43]" />
                Check your email for a welcome message
              </li>
              <li className="flex items-center gap-2">
                <Music size={14} className="text-[#e22a43]" />
                Get notified about new releases first
              </li>
              <li className="flex items-center gap-2">
                <Users size={14} className="text-[#e22a43]" />
                Get invited to exclusive secret gigs
              </li>
            </ul>
          </div>
          
          {/* Stay Connected Section */}
          <div className="text-left mb-6">
            <h2 className="text-lg font-bold text-[#3d405b] mb-3">Stay Connected</h2>
            <p className="text-sm text-[#3d405b] mb-3">
              Follow me on social media for daily updates and live content:
            </p>
            <div className="flex flex-col space-y-2">
              <a 
                href="https://www.tiktok.com/@graceperiodmusic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#e22a43] hover:text-red-600 transition-colors text-sm"
              >
                <SiTiktok size={16} />
                @graceperiodmusic on TikTok
              </a>
              <a 
                href="https://instagram.com/graceperiodmusic" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#e22a43] hover:text-red-600 transition-colors text-sm"
              >
                <SiInstagram size={16} />
                @graceperiodmusic on Instagram
              </a>
            </div>
          </div>
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-[#e22a43] text-white py-3 px-6 rounded font-semibold hover:bg-red-600 transition-all"
          >
            Continue Exploring
          </Button>
        </div>
      </div>
    </div>
  );
}