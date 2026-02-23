"use client";
import React, { useState, useEffect } from "react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import BlogCard from "@/components/ui/Blog/BlogCard";
import CategoryCard from "@/components/ui/Blog/CategoryCard";

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

const BlogPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();
        if (Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        } else {
          setBlogs([]);
        }
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const categories = [
    {
      icon: "ShoppingCart",
      title: "Shopping Guides",
      items: [
        "Product recommendations, buying tips, and comparisons",
        "Learn how to shop smart and safely online",
        "Discover new products and deals",
        "Get updates on policies and features",
      ],
    },
    {
      icon: "TrendingUp",
      title: "Seller Insights",
      items: [
        "Tips for growing your business on FirgoMart",
        "Marketing strategies and best practices",
        "Understanding seller tools and analytics",
        "Success stories from our seller community",
      ],
    },
    {
      icon: "ShieldCheck",
      title: "Platform News",
      items: [
        "Updates on platform features and improvements",
        "Security and privacy enhancements",
        "Community guidelines and policy changes",
        "Company announcements and events",
      ],
    },
  ];

  return (
      <div className="bg-[var(--background)] text-[color:var(--foreground)] min-h-screen">
        <section className="relative py-20 bg-brand-purple overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="w-7 h-7 text-white" />
                <Title level={1}>The FirgoMart Blog</Title>
              </div>
              <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
                Insights, updates, and stories from the world of e-commerce.
              </Paragraph>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {categories.map((category, index) => (
              <CategoryCard 
                key={index} 
                category={category} 
                index={index} 
              />
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-[color:var(--foreground)] border-b border-[var(--foreground)/10] pb-4">
              Latest Articles
            </h2>

            {loading ? (
              <div className="flex justify-center py-20">
                <BeautifulLoader />
              </div>
            ) : Array.isArray(blogs) && blogs.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[var(--foreground)/5] rounded-2xl border border-[var(--foreground)/10]">
                <p className="text-[var(--foreground)/60] text-lg">
                  No articles published yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default BlogPage;
