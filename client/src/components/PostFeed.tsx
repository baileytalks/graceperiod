import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Tag } from "lucide-react";

interface Post {
  id: string;
  title: string;
  body: string;
  tags: string[];
  publishedDate: string | null;
  url: string;
  coverImage: string | null;
}

export default function PostFeed() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['/api/posts'],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#3d405b] text-sm">Unable to load posts at the moment.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[#3d405b] text-sm">No posts available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
        >
          {post.coverImage && (
            <div className="w-full h-32 overflow-hidden">
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          
          <div className="p-4">
            <h4 className="text-[#e22a43] font-bold mb-2 text-sm">
              {post.title}
            </h4>
            
            {post.body && (
              <p className="text-[#3d405b] mb-3 leading-relaxed text-sm">
                {post.body}
              </p>
            )}
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#f4f1de] text-[#3d405b] px-2 py-1 rounded text-xs font-medium border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {post.publishedDate && (
              <div className="text-xs text-gray-500">
                {format(new Date(post.publishedDate), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}