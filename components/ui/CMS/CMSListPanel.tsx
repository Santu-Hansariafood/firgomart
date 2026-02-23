import React from 'react'
import { Trash2, Edit, Briefcase } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { CMSState } from '@/hooks/cms/useCMSState'

interface CMSListPanelProps {
  state: CMSState
}

export function CMSListPanel({ state }: CMSListPanelProps) {
  const {
    activeTab,
    safeDepartments,
    safeMembers,
    safeBlogs,
    safeCareers,
    handleEditDept,
    handleEditTeam,
    handleEditBlog,
    handleEditCareer,
    handleDeleteDept,
    handleDeleteTeam,
    handleDeleteBlog,
    handleDeleteCareer
  } = state

  const departments = Array.isArray(safeDepartments) ? safeDepartments : []
  const members = Array.isArray(safeMembers) ? safeMembers : []
  const blogs = Array.isArray(safeBlogs) ? safeBlogs : []
  const careers = Array.isArray(safeCareers) ? safeCareers : []

  return (
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
                <div
                  key={dept._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                      {React.createElement(
                        (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[dept.icon] ||
                          LucideIcons.Package,
                        { size: 20 }
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{dept.name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{dept.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditDept(dept)}
                      className="p-2 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(dept._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
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
                <div
                  key={member._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={member.image || 'https://via.placeholder.com/150'}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h4 className="font-medium text-foreground">{member.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                          {member.department}
                        </span>
                        <span>•</span>
                        <span>{member.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTeam(member)}
                      className="p-2 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(member._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
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
                <div
                  key={blog._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={blog.image || 'https://via.placeholder.com/150'}
                      alt={blog.title}
                      className="w-16 h-12 rounded object-cover border border-gray-200"
                    />
                    <div>
                      <h4 className="font-medium text-foreground line-clamp-1">{blog.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {blog.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span>•</span>
                        <span>{blog.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditBlog(blog)}
                      className="p-2 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteBlog(blog._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
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
                <div
                  key={career._id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{career.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
                          {career.department}
                        </span>
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
                    <button
                      onClick={() => handleEditCareer(career)}
                      className="p-2 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCareer(career._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
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
  )
}
