"use client";
import React, { useState, useEffect } from "react";
import BeautifulLoader from "@/components/common/Loader/BeautifulLoader";
import Title from "@/components/common/Title/Title";
import Paragraph from "@/components/common/Paragraph/Paragraph";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import DepartmentCard from "@/components/ui/Teams/DepartmentCard";
import DepartmentModal from "@/components/ui/Teams/DepartmentModal";

interface Department {
  _id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  department: string;
  image: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
  };
}

type TeamData = Record<
  string,
  {
    logo?: string;
    description?: string;
    members?: Array<{
      name: string;
      image: string;
      bio?: string;
      links?: any;
    }>;
  }
>;

const TeamsPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, teamRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/teams"),
        ]);
        const deptData = await deptRes.json();
        const teamData = await teamRes.json();

        if (deptData.departments) setDepartments(deptData.departments);
        if (teamData.teams) setMembers(teamData.teams);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const teamData: TeamData = {};
  departments.forEach((dept) => {
    teamData[dept.name] = {
      logo: dept.icon,
      description: dept.description,
      members: members
        .filter((m) => m.department === dept.name)
        .map((m) => ({
          name: m.name,
          image: m.image,
          bio: m.bio,
          links: {
             linkedin: m.socialLinks?.linkedin,
             twitter: m.socialLinks?.twitter,
             x: m.socialLinks?.twitter,
             instagram: m.socialLinks?.instagram,
             facebook: m.socialLinks?.facebook
          },
        })),
    };
  });

  useEffect(() => {
    if (activeTitle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeTitle]);

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
                <Users className="w-7 h-7 text-white" />
                <Title level={1}>Our Teams – FirgoMart</Title>
              </div>
              <Paragraph className="max-w-3xl mx-auto text-purple-100 text-lg sm:text-xl">
                At FirgoMart, our strength lies in our people. Our teams work
                together across technology, logistics, operations, and customer
                service to deliver a reliable and seamless e-commerce experience
                worldwide.
              </Paragraph>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <Paragraph className="text-[var(--foreground)/70]">
              We believe in collaboration, innovation, accountability, and
              continuous improvement. Every team at FirgoMart plays a vital role
              in ensuring quality service and customer satisfaction.
            </Paragraph>
          </div>

          {loading ? (
             <div className="flex justify-center py-20"><BeautifulLoader /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {departments.map((dept, index) => (
                <DepartmentCard 
                  key={dept._id} 
                  dept={dept} 
                  index={index} 
                  onViewClick={setActiveTitle} 
                />
              ))}
            </div>
          )}

          <DepartmentModal 
            activeTitle={activeTitle} 
            teamData={teamData} 
            onClose={() => setActiveTitle(null)} 
          />
        </div>
      </div>
  );
};

export default TeamsPage;
