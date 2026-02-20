import { Edit, Plus, Save, X, Loader2, Upload, ImageIcon } from 'lucide-react'
import CommonInput from '@/components/common/CommonInput/CommonInput'
import { CMSState } from '@/hooks/cms/useCMSState'

interface CMSFormPanelProps {
  state: CMSState
}

export function CMSFormPanel({ state }: CMSFormPanelProps) {
  const {
    activeTab,
    isEditing,
    forms,
    setForms,
    safeDepartments,
    uploading,
    handleImageUpload,
    handleSubmitDept,
    handleSubmitTeam,
    handleSubmitBlog,
    handleSubmitCareer,
    resetForms
  } = state

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 sticky top-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        {isEditing ? <Edit size={20} /> : <Plus size={20} />}
        {isEditing ? 'Edit' : 'Add'}{' '}
        {activeTab === 'departments'
          ? 'Department'
          : activeTab === 'teams'
          ? 'Team Member'
          : activeTab === 'blogs'
          ? 'Blog Post'
          : 'Job Opening'}
      </h2>
      {activeTab === 'departments' && (
        <form onSubmit={handleSubmitDept} className="space-y-4">
          <CommonInput
            label="Department Name"
            value={forms.deptForm.name}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                deptForm: { ...prev.deptForm, name: val }
              }))
            }
            required
            placeholder="e.g. Engineering"
          />
          <CommonInput
            label="Icon (Lucide name)"
            value={forms.deptForm.icon}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                deptForm: { ...prev.deptForm, icon: val }
              }))
            }
            required
            placeholder="e.g. Code, Users, Package"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground/70">Description</label>
            <textarea
              value={forms.deptForm.description}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  deptForm: { ...prev.deptForm, description: e.target.value }
                }))
              }
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              rows={3}
              required
            />
          </div>
          <CommonInput
            label="Order Priority"
            value={String(forms.deptForm.order)}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                deptForm: { ...prev.deptForm, order: Number(val) }
              }))
            }
            type="number"
          />
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-brand-purple text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            >
              <Save size={18} /> Save
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForms}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
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
            value={forms.teamForm.name}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                teamForm: { ...prev.teamForm, name: val }
              }))
            }
            required
          />
          <CommonInput
            label="Role"
            value={forms.teamForm.role}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                teamForm: { ...prev.teamForm, role: val }
              }))
            }
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground/70">Department</label>
            <select
              value={forms.teamForm.department}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  teamForm: { ...prev.teamForm, department: e.target.value }
                }))
              }
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              required
            >
              <option value="">Select Department</option>
              {safeDepartments.map(dept => (
                <option key={dept._id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground/70">Profile Image</label>
            <div className="flex items-center gap-4">
              {forms.teamForm.image ? (
                <div className="relative group">
                  <img src={forms.teamForm.image} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
                  <button
                    type="button"
                    onClick={() =>
                      setForms(prev => ({
                        ...prev,
                        teamForm: { ...prev.teamForm, image: '' }
                      }))
                    }
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
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'team')}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          <CommonInput
            label="Or Image URL"
            value={forms.teamForm.image}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                teamForm: { ...prev.teamForm, image: val }
              }))
            }
            placeholder="https://..."
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground/70">Bio (Optional)</label>
            <textarea
              value={forms.teamForm.bio}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  teamForm: { ...prev.teamForm, bio: e.target.value }
                }))
              }
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <CommonInput
              label="LinkedIn"
              value={forms.teamForm.linkedin}
              onChange={val =>
                setForms(prev => ({
                  ...prev,
                  teamForm: { ...prev.teamForm, linkedin: val }
                }))
              }
              placeholder="URL"
            />
            <CommonInput
              label="Twitter"
              value={forms.teamForm.twitter}
              onChange={val =>
                setForms(prev => ({
                  ...prev,
                  teamForm: { ...prev.teamForm, twitter: val }
                }))
              }
              placeholder="URL"
            />
            <CommonInput
              label="GitHub"
              value={forms.teamForm.github}
              onChange={val =>
                setForms(prev => ({
                  ...prev,
                  teamForm: { ...prev.teamForm, github: val }
                }))
              }
              placeholder="URL"
            />
          </div>
          <CommonInput
            label="Order"
            value={String(forms.teamForm.order)}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                teamForm: { ...prev.teamForm, order: Number(val) }
              }))
            }
            type="number"
          />
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-brand-purple text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            >
              <Save size={18} /> Save Member
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForms}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
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
            value={forms.blogForm.title}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                blogForm: {
                  ...prev.blogForm,
                  title: val,
                  slug: val.toLowerCase().replace(/ /g, '-')
                }
              }))
            }
            required
          />
          <CommonInput
            label="Slug"
            value={forms.blogForm.slug}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                blogForm: { ...prev.blogForm, slug: val }
              }))
            }
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground/70">Excerpt</label>
            <textarea
              value={forms.blogForm.excerpt}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  blogForm: { ...prev.blogForm, excerpt: e.target.value }
                }))
              }
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              rows={2}
              placeholder="Short description..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground/70">Content (Markdown supported)</label>
            <textarea
              value={forms.blogForm.content}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  blogForm: { ...prev.blogForm, content: e.target.value }
                }))
              }
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background font-mono text-sm"
              rows={8}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <CommonInput
              label="Author"
              value={forms.blogForm.author}
              onChange={val =>
                setForms(prev => ({
                  ...prev,
                  blogForm: { ...prev.blogForm, author: val }
                }))
              }
              required
            />
            <CommonInput
              label="Category"
              value={forms.blogForm.category}
              onChange={val =>
                setForms(prev => ({
                  ...prev,
                  blogForm: { ...prev.blogForm, category: val }
                }))
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground/70">Featured Image</label>
            <div className="flex items-center gap-4">
              {forms.blogForm.image ? (
                <div className="relative group">
                  <img src={forms.blogForm.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover border" />
                  <button
                    type="button"
                    onClick={() =>
                      setForms(prev => ({
                        ...prev,
                        blogForm: { ...prev.blogForm, image: '' }
                      }))
                    }
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
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'blog')}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          <CommonInput
            label="Tags (comma separated)"
            value={forms.blogForm.tags}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                blogForm: { ...prev.blogForm, tags: val }
              }))
            }
            placeholder="tech, react, nextjs"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forms.blogForm.isPublished}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  blogForm: { ...prev.blogForm, isPublished: e.target.checked }
                }))
              }
              className="w-4 h-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
            />
            <span className="text-sm font-medium">Publish immediately</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-brand-purple text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            >
              <Save size={18} /> {isEditing ? 'Update Blog' : 'Create Blog'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForms}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
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
            value={forms.careerForm.title}
            onChange={val =>
              setForms(prev => ({
                ...prev,
                careerForm: { ...prev.careerForm, title: val }
              }))
            }
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground/70">Department</label>
              <select
                value={forms.careerForm.department}
                onChange={e =>
                  setForms(prev => ({
                    ...prev,
                    careerForm: { ...prev.careerForm, department: e.target.value }
                  }))
                }
                className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                required
              >
                <option value="">Select Dept</option>
                {safeDepartments.map(dept => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <CommonInput
              label="Location"
              value={forms.careerForm.location}
              onChange={val =>
                setForms(prev => ({
                  ...prev,
                  careerForm: { ...prev.careerForm, location: val }
                }))
              }
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground/70">Job Type</label>
            <select
              value={forms.careerForm.type}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  careerForm: { ...prev.careerForm, type: e.target.value }
                }))
              }
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
              value={forms.careerForm.description}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  careerForm: { ...prev.careerForm, description: e.target.value }
                }))
              }
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              rows={3}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground/70">Requirements (one per line)</label>
            <textarea
              value={forms.careerForm.requirements}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  careerForm: { ...prev.careerForm, requirements: e.target.value }
                }))
              }
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground/70">Benefits (one per line)</label>
            <textarea
              value={forms.careerForm.benefits}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  careerForm: { ...prev.careerForm, benefits: e.target.value }
                }))
              }
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-background"
              rows={3}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forms.careerForm.isActive}
              onChange={e =>
                setForms(prev => ({
                  ...prev,
                  careerForm: { ...prev.careerForm, isActive: e.target.checked }
                }))
              }
              className="w-4 h-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
            />
            <span className="text-sm font-medium">Open for applications</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-brand-purple text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            >
              <Save size={18} /> {isEditing ? 'Update Job' : 'Post Job'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForms}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
