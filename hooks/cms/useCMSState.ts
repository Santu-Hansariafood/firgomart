'use client'

import { useState, useEffect, Dispatch, SetStateAction, ChangeEvent, FormEvent } from 'react'
import toast from 'react-hot-toast'

export interface Department {
  _id: string
  name: string
  description: string
  icon: string
  order: number
}

export interface TeamMember {
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

export interface Blog {
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

export interface Career {
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

export type TabKey = 'departments' | 'teams' | 'blogs' | 'careers'

export interface CMSFormsState {
  deptForm: {
    name: string
    description: string
    icon: string
    order: number
  }
  teamForm: {
    name: string
    role: string
    department: string
    image: string
    bio: string
    linkedin: string
    twitter: string
    github: string
    order: number
  }
  blogForm: {
    title: string
    slug: string
    content: string
    excerpt: string
    author: string
    category: string
    image: string
    tags: string
    isPublished: boolean
  }
  careerForm: {
    title: string
    department: string
    location: string
    type: string
    description: string
    requirements: string
    benefits: string
    isActive: boolean
  }
}

export interface CMSState {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
  departments: Department[]
  members: TeamMember[]
  blogs: Blog[]
  careers: Career[]
  safeDepartments: Department[]
  safeMembers: TeamMember[]
  safeBlogs: Blog[]
  safeCareers: Career[]
  loading: boolean
  uploading: boolean
  setUploading: (value: boolean) => void
  isEditing: boolean
  forms: CMSFormsState
  setForms: Dispatch<SetStateAction<CMSFormsState>>
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>, target: 'team' | 'blog') => void
  resetForms: () => void
  handleSubmitDept: (e: FormEvent) => void
  handleSubmitTeam: (e: FormEvent) => void
  handleSubmitBlog: (e: FormEvent) => void
  handleSubmitCareer: (e: FormEvent) => void
  handleEditDept: (dept: Department) => void
  handleEditTeam: (member: TeamMember) => void
  handleEditBlog: (blog: Blog) => void
  handleEditCareer: (career: Career) => void
  handleDeleteDept: (id: string) => void
  handleDeleteTeam: (id: string) => void
  handleDeleteBlog: (id: string) => void
  handleDeleteCareer: (id: string) => void
}

export function useCMSState(): CMSState {
  const [activeTab, setActiveTab] = useState<TabKey>('departments')
  const [departments, setDepartments] = useState<Department[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState<string | null>(null)

  const [forms, setForms] = useState<CMSFormsState>({
    deptForm: {
      name: '',
      description: '',
      icon: 'Package',
      order: 0
    },
    teamForm: {
      name: '',
      role: '',
      department: '',
      image: '',
      bio: '',
      linkedin: '',
      twitter: '',
      github: '',
      order: 0
    },
    blogForm: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      author: '',
      category: '',
      image: '',
      tags: '',
      isPublished: false
    },
    careerForm: {
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      description: '',
      requirements: '',
      benefits: '',
      isActive: true
    }
  })

  const safeDepartments = Array.isArray(departments) ? departments : []
  const safeMembers = Array.isArray(members) ? members : []
  const safeBlogs = Array.isArray(blogs) ? blogs : []
  const safeCareers = Array.isArray(careers) ? careers : []

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [deptRes, teamRes, blogRes, careerRes] = await Promise.all([
        fetch('/api/departments', { cache: 'no-store' }),
        fetch('/api/teams', { cache: 'no-store' }),
        fetch('/api/blogs', { cache: 'no-store' }),
        fetch('/api/careers', { cache: 'no-store' })
      ])
      const deptData = await deptRes.json()
      const teamData = await teamRes.json()
      const blogData = await blogRes.json()
      const careerData = await careerRes.json()

      if (deptData.departments) setDepartments(deptData.departments)
      if (teamData.teams) setMembers(teamData.teams)
      if (blogData.blogs) setBlogs(blogData.blogs)
      if (careerData.careers) setCareers(careerData.careers)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const resetForms = () => {
    setForms({
      deptForm: {
        name: '',
        description: '',
        icon: 'Package',
        order: 0
      },
      teamForm: {
        name: '',
        role: '',
        department: '',
        image: '',
        bio: '',
        linkedin: '',
        twitter: '',
        github: '',
        order: 0
      },
      blogForm: {
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        author: '',
        category: '',
        image: '',
        tags: '',
        isPublished: false
      },
      careerForm: {
        title: '',
        department: '',
        location: '',
        type: 'Full-time',
        description: '',
        requirements: '',
        benefits: '',
        isActive: true
      }
    })
    setIsEditing(false)
    setCurrentId(null)
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, target: 'team' | 'blog') => {
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
          if (target === 'team') {
            setForms(prev => ({
              ...prev,
              teamForm: { ...prev.teamForm, image: data.urls[0] }
            }))
          } else {
            setForms(prev => ({
              ...prev,
              blogForm: { ...prev.blogForm, image: data.urls[0] }
            }))
          }
          toast.success('Image uploaded')
        } else {
          toast.error('Upload failed')
        }
      }
    } catch {
      toast.error('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleEditDept = (dept: Department) => {
    setForms(prev => ({
      ...prev,
      deptForm: {
        name: dept.name,
        description: dept.description,
        icon: dept.icon,
        order: dept.order
      }
    }))
    setCurrentId(dept._id)
    setIsEditing(true)
    setActiveTab('departments')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditTeam = (member: TeamMember) => {
    setForms(prev => ({
      ...prev,
      teamForm: {
        name: member.name,
        role: member.role,
        department: member.department,
        image: member.image,
        bio: member.bio || '',
        linkedin: member.socialLinks?.linkedin || '',
        twitter: member.socialLinks?.twitter || '',
        github: member.socialLinks?.github || '',
        order: member.order || 0
      }
    }))
    setCurrentId(member._id)
    setIsEditing(true)
    setActiveTab('teams')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditBlog = (blog: Blog) => {
    setForms(prev => ({
      ...prev,
      blogForm: {
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt || '',
        author: blog.author,
        category: blog.category,
        image: blog.image,
        tags: blog.tags.join(', '),
        isPublished: blog.isPublished
      }
    }))
    setCurrentId(blog._id)
    setIsEditing(true)
    setActiveTab('blogs')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEditCareer = (career: Career) => {
    setForms(prev => ({
      ...prev,
      careerForm: {
        title: career.title,
        department: career.department,
        location: career.location,
        type: career.type,
        description: career.description,
        requirements: career.requirements.join('\n'),
        benefits: career.benefits.join('\n'),
        isActive: career.isActive
      }
    }))
    setCurrentId(career._id)
    setIsEditing(true)
    setActiveTab('careers')
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
    } catch {
      toast.error('Error deleting department')
    }
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
    } catch {
      toast.error('Error deleting member')
    }
  }

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Blog deleted')
        setBlogs(prev => prev.filter(b => b._id !== id))
      } else {
        toast.error('Failed to delete blog')
      }
    } catch {
      toast.error('Error deleting blog')
    }
  }

  const handleDeleteCareer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job opening?')) return
    try {
      const res = await fetch(`/api/careers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Job deleted')
        setCareers(prev => prev.filter(c => c._id !== id))
      } else {
        toast.error('Failed to delete job')
      }
    } catch {
      toast.error('Error deleting job')
    }
  }

  const handleSubmitDept = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const url = isEditing && currentId ? `/api/departments/${currentId}` : '/api/departments'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forms.deptForm)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(isEditing ? 'Department updated' : 'Department created')
        fetchData()
        resetForms()
      } else {
        toast.error(data.error || 'Operation failed')
      }
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleSubmitTeam = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...forms.teamForm,
        socialLinks: {
          linkedin: forms.teamForm.linkedin,
          twitter: forms.teamForm.twitter,
          github: forms.teamForm.github
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
    } catch {
      toast.error('Something went wrong')
    }
  }

  const handleSubmitBlog = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const body = {
        ...forms.blogForm,
        tags: forms.blogForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      }
      const url = isEditing && currentId ? `/api/blogs/${currentId}` : '/api/blogs'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(isEditing ? 'Blog updated' : 'Blog created')
        fetchData()
        resetForms()
      } else {
        toast.error(data.error || 'Failed to save blog')
      }
    } catch {
      toast.error('Error saving blog')
    }
  }

  const handleSubmitCareer = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const body = {
        ...forms.careerForm,
        requirements: forms.careerForm.requirements.split('\n').map(r => r.trim()).filter(Boolean),
        benefits: forms.careerForm.benefits.split('\n').map(b => b.trim()).filter(Boolean)
      }
      const url = isEditing && currentId ? `/api/careers/${currentId}` : '/api/careers'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(isEditing ? 'Job updated' : 'Job created')
        fetchData()
        resetForms()
      } else {
        toast.error(data.error || 'Failed to save job')
      }
    } catch {
      toast.error('Error saving job')
    }
  }

  return {
    activeTab,
    setActiveTab,
    departments,
    members,
    blogs,
    careers,
    safeDepartments,
    safeMembers,
    safeBlogs,
    safeCareers,
    loading,
    uploading,
    setUploading,
    isEditing,
    forms,
    setForms,
    handleImageUpload,
    resetForms,
    handleSubmitDept,
    handleSubmitTeam,
    handleSubmitBlog,
    handleSubmitCareer,
    handleEditDept,
    handleEditTeam,
    handleEditBlog,
    handleEditCareer,
    handleDeleteDept,
    handleDeleteTeam,
    handleDeleteBlog,
    handleDeleteCareer
  }
}
