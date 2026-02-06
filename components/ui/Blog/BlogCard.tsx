"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, User, Tag, ChevronRight } from "lucide-react";
import FallbackImage from "@/components/common/Image/FallbackImage";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  category: string;
  image: string;
  publishedAt: string;
  createdAt: string;
}

interface BlogCardProps {
  blog: Blog;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, expandedId, setExpandedId }) => {
  const isExpanded = expandedId === blog._id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--background)] rounded-2xl overflow-hidden shadow-sm border border-[var(--foreground)/10] flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className="relative h-64 w-full cursor-pointer overflow-hidden"
        onClick={() => setExpandedId(isExpanded ? null : blog._id)}
      >
        <FallbackImage
          src={blog.image}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-brand-purple/90 text-white text-xs font-bold rounded-full backdrop-blur-md flex items-center gap-1 shadow-lg border border-white/20">
            <Tag className="w-3 h-3" /> {blog.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow relative">
        <div className="flex items-center gap-4 text-xs font-medium text-[var(--foreground)/60] mb-4">
          <span className="flex items-center gap-1.5 bg-[var(--foreground)/5] px-2 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5" />{" "}
            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1.5 bg-[var(--foreground)/5] px-2 py-1 rounded-md">
            <User className="w-3.5 h-3.5" /> {blog.author}
          </span>
        </div>

        <h3
          className="text-2xl font-bold text-[color:var(--foreground)] mb-3 cursor-pointer hover:text-brand-purple transition-colors leading-tight"
          onClick={() => setExpandedId(isExpanded ? null : blog._id)}
        >
          {blog.title}
        </h3>

        {!isExpanded && (
          <div className="text-[var(--foreground)/70] line-clamp-3 mb-6 text-sm flex-grow leading-relaxed">
            {blog.excerpt || (
              <div
                dangerouslySetInnerHTML={{ __html: blog.content }}
                className="line-clamp-3"
              />
            )}
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--foreground)/10]">
          <button
            onClick={() => setExpandedId(isExpanded ? null : blog._id)}
            className="flex items-center gap-1 text-brand-purple text-sm font-bold hover:gap-2 transition-all uppercase tracking-wide"
          >
            {isExpanded ? "Close Article" : "Read Article"}
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-300 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[var(--foreground)/10] bg-[var(--foreground)/5]"
          >
            <div className="p-8">
              <div className="prose prose-purple max-w-none text-[var(--foreground)/80] prose-headings:text-[color:var(--foreground)] prose-strong:text-[color:var(--foreground)] prose-a:text-brand-purple">
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BlogCard;
