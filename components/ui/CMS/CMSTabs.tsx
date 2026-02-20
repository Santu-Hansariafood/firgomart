import { Building, Users, FileText, Briefcase } from 'lucide-react'
import { TabKey } from '@/hooks/cms/useCMSState'

interface CMSTabsProps {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
  onReset: () => void
}

export function CMSTabs({ activeTab, onChange, onReset }: CMSTabsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 className="text-3xl font-bold text-foreground">CMS Management</h1>
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => {
            onChange('departments')
            onReset()
          }}
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
          onClick={() => {
            onChange('teams')
            onReset()
          }}
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
          onClick={() => {
            onChange('blogs')
            onReset()
          }}
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
          onClick={() => {
            onChange('careers')
            onReset()
          }}
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
  )
}
