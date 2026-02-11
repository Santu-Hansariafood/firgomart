"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Trash2, Edit, Plus, Users, Building, Save, X, Check, Loader2, Upload, ImageIcon, FileText, Briefcase, ExternalLink, Globe } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import toast from 'react-hot-toast'
import CommonInput from '@/components/common/CommonInput/CommonInput'
import CommonTable from '@/components/common/Table/CommonTable'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import BeautifulLoader from '@/components/common/Loader/BeautifulLoader'
import AdminLogin from '@/components/ui/AdminLogin/AdminLogin'

interface Department {
  _id: string
  name: string
  description: string
  icon: string
  order: number
}

interface TeamMember {
  _id: string
  name: string
  role: string
  department: string
  image: string
  bio?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  order?: number
}

interface Blog {
  _id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  author: string
  category: string
  image: string
  tags: string[]
  isPublished: boolean
}

interface Career {
  _id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  benefits: string[]
  isActive: boolean
}

export default function CMSPage() {
  const { user: authUser, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'departments' | 'teams' | 'blogs' | 'careers'>('departments')
  const [departments, setDepartments] = useState<Department[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const allowed = useMemo(() => {
    if (!authUser) return false
    const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    return emails.includes(authUser.email?.toLowerCase() || "") || (authUser as any).role === "admin"
  }, [authUser])

  // Form States
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)
  
  // Department Form
  const [deptForm, setDeptForm] = useState({
    name: '',
    description: '',
    icon: 'Package',
    order: 0
  })

  // Team Member Form
  const [teamForm, setTeamForm] = useState({
    name: '',
    role: '',
    department: '',
    image: '',
    bio: '',
    linkedin: '',
    twitter: '',
    github: '',
    order: 0
  })

  // Blog Form
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    image: '',
    tags: '',
    isPublished: false
  })

  // Career Form
  const [careerForm, setCareerForm] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    benefits: '',
    isActive: true
  })

  useEffect(() => {
    if (allowed) fetchData()
  }, [allowed])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [deptRes, teamRes, blogRes, careerRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/teams'),
        fetch('/api/blogs'),
        fetch('/api/careers')
      ])
      const deptData = await deptRes.json()
      const teamData = await teamRes.json()
      const blogData = await blogRes.json()
      const careerData = await careerRes.json()

      if (deptData.departments) setDepartments(deptData.departments)
      if (teamData.teams) setMembers(teamData.teams)
      if (blogData.blogs) setBlogs(blogData.blogs)
      if (careerData.careers) setCareers(careerData.careers)
    } catch (error) {
      console.error('Failed to fetch data', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'team' | 'blog') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        const res = await fetch('/api/upload/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: [base64data] })
        })
        const data = await res.json()
        if (data.urls?.[0]) {
          if (target === 'team') setTeamForm(prev => ({ ...prev, image: data.urls[0] }))
          if (target === 'blog') setBlogForm(prev => ({ ...prev, image: data.urls[0] }))
          toast.success('Image uploaded')
        } else {
          toast.error('Upload failed')
        }
      }
    } catch (error) {
      console.error('Upload error', error)
      toast.error('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const resetForms = () => {
    setDeptForm({ name: '', description: '', icon: 'Package', order: 0 })
    setTeamForm({
      name: '', role: '', department: '', image: '', bio: '',
      linkedin: '', twitter: '', github: '', order: 0
    })
    setBlogForm({
      title: '', slug: '', content: '', excerpt: '',
      author: '', category: '', image: '', tags: '', isPublished: false
    })
    setCareerForm({
      title: '', department: '', location: '', type: 'Full-time',
      description: '', requirements: '', benefits: '', isActive: true
    })
    setIsEditing(false)
    setCurrentId(null)
  }

  // --- Department Actions ---

  const handleEditDept = (dept: Department) => {
    setDeptForm({
      name: dept.name,
      description: dept.description,
      icon: dept.icon,
      order: dept.order
    })
    setCurrentId(dept._id)
    setIsEditing(true)
    setActiveTab('departments')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return
    try {
      const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Department deleted')
        setDepartments(prev => prev.filter(d => d._id !== id))
      } else {
        toast.error('Failed to delete department')
      }
    } catch (error) {
      toast.error('Error deleting department')
    }
  }

  const handleSubmitDept = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = isEditing && currentId ? `/api/departments/${currentId}` : '/api/departments'
      const method = isEditing ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm)
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(isEditing ? 'Department updated' : 'Department created')
        fetchData() // Refresh list
        resetForms()
      } else {
        toast.error(data.error || 'Operation failed')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  // --- Team Actions ---

  const handleEditTeam = (member: TeamMember) => {
    setTeamForm({
      name: member.name,
      role: member.role,
      department: member.department,
      image: member.image,
      bio: member.bio || '',
      linkedin: member.socialLinks?.linkedin || '',
      twitter: member.socialLinks?.twitter || '',
      github: member.socialLinks?.github || '',
      order: member.order || 0
    })
    setCurrentId(member._id)
    setIsEditing(true)
    setActiveTab('teams')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteTeam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return
    try {
      const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Team member deleted')
        setMembers(prev => prev.filter(m => m._id !== id))
      } else {
        toast.error('Failed to delete member')
      }
    } catch (error) {
      toast.error('Error deleting member')
    }
  }

  const handleSubmitTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...teamForm,
        socialLinks: {
          linkedin: teamForm.linkedin,
          twitter: teamForm.twitter,
          github: teamForm.github
        }
      }

      const url = isEditing && currentId ? `/api/teams/${currentId}` : '/api/teams'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(isEditing ? 'Member updated' : 'Member created')
        fetchData()
        resetForms()
      } else {
        toast.error(data.error || 'Operation failed')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  // --- Blog Actions ---

  const handleEditBlog = (blog: Blog) => {
    setBlogForm({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt || '',
      author: blog.author,
      category: blog.category,
      image: blog.image,
      tags: blog.tags.join(', '),
      isPublished: blog.isPublished
    })
    setCurrentId(blog._id)
    setIsEditing(true)
    setActiveTab('blogs')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Blog deleted')
        setBlogs(prev => prev.filter(b => b._id !== id))
      }
    } catch (error) {
      toast.error('Error deleting blog')
    }
  }

  const handleSubmitBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body = {
        ...blogForm,
        tags: blogForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      }
      const url = isEditing && currentId ? `/api/blogs/${currentId}` : '/api/blogs'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(isEditing ? 'Blog updated' : 'Blog created')
        fetchData()
        resetForms()
      } else {
        toast.error('Failed to save blog')
      }
    } catch (error) {
      toast.error('Error saving blog')
    }
  }

  // --- Career Actions ---

  const handleEditCareer = (career: Career) => {
    setCareerForm({
      title: career.title,
      department: career.department,
      location: career.location,
      type: career.type,
      description: career.description,
      requirements: career.requirements.join('\n'),
      benefits: career.benefits.join('\n'),
      isActive: career.isActive
    })
    setCurrentId(career._id)
    setIsEditing(true)
    setActiveTab('careers')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteCareer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job opening?')) return
    try {
      const res = await fetch(`/api/careers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Job deleted')
        setCareers(prev => prev.filter(c => c._id !== id))
      }
    } catch (error) {
      toast.error('Error deleting job')
    }
  }

  const handleSubmitCareer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body = {
        ...careerForm,
        requirements: careerForm.requirements.split('\n').map(r => r.trim()).filter(Boolean),
        benefits: careerForm.benefits.split('\n').map(b => b.trim()).filter(Boolean)
      }
      const url = isEditing && currentId ? `/api/careers/${currentId}` : '/api/careers'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast.success(isEditing ? 'Job updated' : 'Job created')
        fetchData()
        resetForms()
      } else {
        toast.error('Failed to save job')
      }
    } catch (error) {
      toast.error('Error saving job')
    }
  }

  if (authLoading) return <BeautifulLoader />
  if (!allowed) return <AdminLogin />
  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-brand-purple" /></div>

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-foreground">CMS Management</h1>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('departments'); resetForms(); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'departments' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-purple' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building size={16} />
              Departments
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('teams'); resetForms(); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'teams' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-purple' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              Team Members
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('blogs'); resetForms(); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'blogs' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-purple' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              Blogs
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('careers'); resetForms(); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'careers' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-purple' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase size={16} />
              Careers
            </div>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              {isEditing ? <Edit size={20} /> : <Plus size={20} />}
              {isEditing ? 'Edit' : 'Add'} {
                activeTab === 'departments' ? 'Department' : 
                activeTab === 'teams' ? 'Team Member' : 
                activeTab === 'blogs' ? 'Blog Post' : 'Job Opening'
              }
            </h2>
            
            {activeTab === 'departments' && (
              <form onSubmit={handleSubmitDept} className="space-y-4">
                <CommonInput 
                  label="Department Name" 
                  value={deptForm.name} 
                  onChange={(val) => setDeptForm({...deptForm, name: val})} 
                  required 
                  placeholder="e.g. Engineering"
                />
                <CommonInput 
                  label="Icon (Lucide name)" 
                  value={deptForm.icon} 
                  onChange={(val) => setDeptForm({...deptForm, icon: val})} 
                  required 
                  placeholder="e.g. Code, Users, Package"
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Description</label>
                  <textarea
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({...deptForm, description: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    rows={3}
                    required
                  />
                </div>
                <CommonInput 
                  label="Order Priority" 
                  value={String(deptForm.order)} 
                  onChange={(val) => setDeptForm({...deptForm, order: Number(val)})} 
                  type="number"
                />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-brand-purple text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                    <Save size={18} /> Save
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForms} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'teams' && (
              <form onSubmit={handleSubmitTeam} className="space-y-4">
                <CommonInput 
                  label="Name" 
                  value={teamForm.name} 
                  onChange={(val) => setTeamForm({...teamForm, name: val})} 
                  required 
                />
                <CommonInput 
                  label="Role" 
                  value={teamForm.role} 
                  onChange={(val) => setTeamForm({...teamForm, role: val})} 
                  required 
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Department</label>
                  <select
                    value={teamForm.department}
                    onChange={(e) => setTeamForm({...teamForm, department: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/70">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {teamForm.image ? (
                      <div className="relative group">
                        <img src={teamForm.image} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
                        <button 
                          type="button"
                          onClick={() => setTeamForm({...teamForm, image: ''})}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-brand-purple transition-colors">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                        <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'team')} disabled={uploading} />
                    </label>
                  </div>
                </div>
                <CommonInput 
                  label="Or Image URL" 
                  value={teamForm.image} 
                  onChange={(val) => setTeamForm({...teamForm, image: val})} 
                  placeholder="https://..."
                />
                 <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Bio (Optional)</label>
                  <textarea
                    value={teamForm.bio}
                    onChange={(e) => setTeamForm({...teamForm, bio: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <CommonInput label="LinkedIn" value={teamForm.linkedin} onChange={(val) => setTeamForm({...teamForm, linkedin: val})} placeholder="URL" />
                  <CommonInput label="Twitter" value={teamForm.twitter} onChange={(val) => setTeamForm({...teamForm, twitter: val})} placeholder="URL" />
                  <CommonInput label="GitHub" value={teamForm.github} onChange={(val) => setTeamForm({...teamForm, github: val})} placeholder="URL" />
                </div>
                <CommonInput 
                  label="Order" 
                  value={String(teamForm.order)} 
                  onChange={(val) => setTeamForm({...teamForm, order: Number(val)})} 
                  type="number"
                />
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-brand-purple text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                    <Save size={18} /> Save Member
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForms} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'blogs' && (
              <form onSubmit={handleSubmitBlog} className="space-y-4">
                <CommonInput 
                  label="Blog Title" 
                  value={blogForm.title} 
                  onChange={(val) => setBlogForm({...blogForm, title: val, slug: val.toLowerCase().replace(/ /g, '-')})} 
                  required 
                />
                <CommonInput 
                  label="Slug" 
                  value={blogForm.slug} 
                  onChange={(val) => setBlogForm({...blogForm, slug: val})} 
                  required 
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Excerpt</label>
                  <textarea
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    rows={2}
                    placeholder="Short description..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Content (Markdown supported)</label>
                  <textarea
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background font-mono text-sm"
                    rows={8}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <CommonInput label="Author" value={blogForm.author} onChange={(val) => setBlogForm({...blogForm, author: val})} required />
                  <CommonInput label="Category" value={blogForm.category} onChange={(val) => setBlogForm({...blogForm, category: val})} required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/70">Featured Image</label>
                  <div className="flex items-center gap-4">
                    {blogForm.image ? (
                      <div className="relative group">
                        <img src={blogForm.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
                        <button 
                          type="button"
                          onClick={() => setBlogForm({...blogForm, image: ''})}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-dashed">
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-brand-purple transition-colors">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                        <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'blog')} disabled={uploading} />
                    </label>
                  </div>
                </div>
                <CommonInput 
                  label="Tags (comma separated)" 
                  value={blogForm.tags} 
                  onChange={(val) => setBlogForm({...blogForm, tags: val})} 
                  placeholder="tech, react, nextjs"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={blogForm.isPublished} 
                    onChange={(e) => setBlogForm({...blogForm, isPublished: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                  />
                  <span className="text-sm font-medium">Publish immediately</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-brand-purple text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                    <Save size={18} /> {isEditing ? 'Update Blog' : 'Create Blog'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForms} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'careers' && (
              <form onSubmit={handleSubmitCareer} className="space-y-4">
                <CommonInput 
                  label="Job Title" 
                  value={careerForm.title} 
                  onChange={(val) => setCareerForm({...careerForm, title: val})} 
                  required 
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-foreground/70">Department</label>
                    <select
                      value={careerForm.department}
                      onChange={(e) => setCareerForm({...careerForm, department: e.target.value})}
                      className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                      required
                    >
                      <option value="">Select Dept</option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <CommonInput label="Location" value={careerForm.location} onChange={(val) => setCareerForm({...careerForm, location: val})} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Job Type</label>
                  <select
                    value={careerForm.type}
                    onChange={(e) => setCareerForm({...careerForm, type: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Description</label>
                  <textarea
                    value={careerForm.description}
                    onChange={(e) => setCareerForm({...careerForm, description: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    rows={3}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Requirements (one per line)</label>
                  <textarea
                    value={careerForm.requirements}
                    onChange={(e) => setCareerForm({...careerForm, requirements: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    rows={3}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground/70">Benefits (one per line)</label>
                  <textarea
                    value={careerForm.benefits}
                    onChange={(e) => setCareerForm({...careerForm, benefits: e.target.value})}
                    className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                    rows={3}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={careerForm.isActive} 
                    onChange={(e) => setCareerForm({...careerForm, isActive: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
                  />
                  <span className="text-sm font-medium">Open for applications</span>
                </label>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 bg-brand-purple text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                    <Save size={18} /> {isEditing ? 'Update Job' : 'Post Job'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForms} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'departments' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Existing Departments</h3>
                <span className="text-sm text-gray-500">{departments.length} total</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {departments.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No departments found. Add one to get started.</div>
                ) : (
                  departments.map(dept => (
                    <div key={dept._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                          {React.createElement((LucideIcons as any)[dept.icon] || LucideIcons.Package, { size: 20 })}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{dept.name}</h4>
                          <p className="text-sm text-gray-500 line-clamp-1">{dept.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditDept(dept)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteDept(dept._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
               <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Team Members</h3>
                <span className="text-sm text-gray-500">{members.length} total</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {members.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No team members found.</div>
                ) : (
                  members.map(member => (
                    <div key={member._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-center gap-4">
                        <img 
                          src={member.image || 'https://via.placeholder.com/150'} 
                          alt={member.name} 
                          className="w-12 h-12 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <h4 className="font-medium text-foreground">{member.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{member.department}</span>
                            <span>•</span>
                            <span>{member.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditTeam(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteTeam(member._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
               <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Blog Posts</h3>
                <span className="text-sm text-gray-500">{blogs.length} total</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {blogs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No blog posts found.</div>
                ) : (
                  blogs.map(blog => (
                    <div key={blog._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-center gap-4">
                        <img 
                          src={blog.image || 'https://via.placeholder.com/150'} 
                          alt={blog.title} 
                          className="w-16 h-12 rounded object-cover border border-gray-200"
                        />
                        <div>
                          <h4 className="font-medium text-foreground line-clamp-1">{blog.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className={`px-2 py-0.5 rounded text-xs ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {blog.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span>•</span>
                            <span>{blog.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditBlog(blog)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteBlog(blog._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'careers' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
               <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Job Openings</h3>
                <span className="text-sm text-gray-500">{careers.length} total</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {careers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No job openings found.</div>
                ) : (
                  careers.map(career => (
                    <div key={career._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{career.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">{career.department}</span>
                            <span>•</span>
                            <span>{career.location}</span>
                            <span>•</span>
                            <span className={career.isActive ? 'text-green-600' : 'text-red-600'}>
                              {career.isActive ? 'Active' : 'Closed'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditCareer(career)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteCareer(career._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
