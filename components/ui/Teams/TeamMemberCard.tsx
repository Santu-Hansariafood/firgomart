"use client";
import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Instagram, Facebook } from "lucide-react";
import FallbackImage from "@/components/common/Image/FallbackImage";

interface TeamMember {
  name: string;
  image: string;
  bio?: string;
  links?: {
    linkedin?: string;
    twitter?: string;
    x?: string;
    instagram?: string;
    facebook?: string;
  };
}

interface TeamMemberCardProps {
  member: TeamMember;
  idx: number;
  activeTitle: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, idx, activeTitle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
      className="bg-[var(--background)] border border-[var(--foreground)/10] rounded-xl overflow-hidden min-w-[260px] w-[260px] sm:w-auto sm:min-w-0 snap-center shrink-0 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="relative w-full h-48 overflow-hidden bg-[var(--foreground)/5]">
        <FallbackImage
          src={member.image}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={activeTitle !== null}
          unoptimized={false}
        />
      </div>
      <div className="p-4">
        <div className="font-semibold text-[color:var(--foreground)] text-lg">
          {member.name}
        </div>
        {member?.bio && (
          <p className="mt-2 text-sm text-[var(--foreground)/70] line-clamp-3">
            {member.bio}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          {member.links?.linkedin && (
            <a
              href={member.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground)/60] hover:text-[#0077b5] transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {(member.links?.twitter || member.links?.x) && (
            <a
              href={member.links.twitter || member.links.x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground)/60] hover:text-[#1DA1F2] transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          )}
          {member.links?.instagram && (
            <a
              href={member.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground)/60] hover:text-[#E1306C] transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
          )}
          {member.links?.facebook && (
            <a
              href={member.links.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground)/60] hover:text-[#1877F2] transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TeamMemberCard;
