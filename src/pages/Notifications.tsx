import { useState, type FC, type ChangeEvent } from 'react'
import {
  useNotifications,
  formatRelativeTime,
  type NotificationItem,
  type NotificationType,
  type NotificationFilterTab,
  type NotificationPriority,
  type NotificationPreferences,
} from './useNotifications'
import './Notifications.css'
import { EnablePushButton } from '../components/EnablePushButton'

export interface NotificationsProps {
  onNavigateToFindJobs?: () => void
  onNavigateToApplications?: () => void
  onNavigateToInterviews?: () => void
  onNavigateToMessages?: (companyName?: string, companyId?: string) => void
  onNavigateToDrives?: () => void
  onNavigateToProfile?: () => void
}

export const Notifications: FC<NotificationsProps> = ({
  onNavigateToFindJobs,
  onNavigateToApplications,
  onNavigateToInterviews,
  onNavigateToMessages,
  onNavigateToDrives,
  onNavigateToProfile,
}) => {
  const {
    filteredNotifications,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    selectedNotificationForDetail,
    setSelectedNotificationForDetail,
    isPreferencesModalOpen,
    setIsPreferencesModalOpen,
    preferences,
    toastMessage,
    tabCounts,
    metrics,
    handleMarkAsRead,
    handleToggleRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleClearAllRead,
    handleSavePreferences,
  } = useNotifications()

  // Local state for preferences modal edit form
  const [modalPrefs, setModalPrefs] = useState<NotificationPreferences>(preferences)

  // Handle deep navigation for a notification
  const handlePerformAction = (item: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    handleMarkAsRead(item.id)

    const targetTab = item.metadata?.target_tab
    const company = item.metadata?.company_name

    if (targetTab === 'interviews' && onNavigateToInterviews) {
      onNavigateToInterviews()
    } else if (targetTab === 'applications' && onNavigateToApplications) {
      onNavigateToApplications()
    } else if (targetTab === 'messages' && onNavigateToMessages) {
      onNavigateToMessages(company)
    } else if (targetTab === 'walk-in-drives' && onNavigateToDrives) {
      onNavigateToDrives()
    } else if ((targetTab === 'find-jobs' || targetTab === 'recommendation-jobs') && onNavigateToFindJobs) {
      onNavigateToFindJobs()
    } else if (targetTab === 'my-profile' && onNavigateToProfile) {
      onNavigateToProfile()
    } else {
      setSelectedNotificationForDetail(item)
    }
  }

  // Helper for type icons
  const getTypeIcon = (type: NotificationType): string => {
    switch (type) {
      case 'interview':
        return 'event_available'
      case 'application':
        return 'description'
      case 'message':
        return 'chat'
      case 'drive':
        return 'apartment'
      case 'recommendation':
        return 'auto_awesome'
      case 'system':
      default:
        return 'verified_user'
    }
  }

  // Helper for action label
  const getActionLabel = (item: NotificationItem): string => {
    if (item.metadata?.action_label) return item.metadata.action_label
    switch (item.type) {
      case 'interview':
        return 'View Interview Details'
      case 'application':
        return 'Track Application'
      case 'message':
        return 'Reply in Messages'
      case 'drive':
        return 'View Walk-in Drive'
      case 'recommendation':
        return 'Review Matched Job'
      case 'system':
      default:
        return 'Inspect Notice'
    }
  }

  const tabs: { id: NotificationFilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All Alerts', count: tabCounts.all },
    { id: 'unread', label: 'Unread', count: tabCounts.unread },
    { id: 'interviews', label: 'Interviews', count: tabCounts.interviews },
    { id: 'applications', label: 'Applications', count: tabCounts.applications },
    { id: 'messages', label: 'Messages', count: tabCounts.messages },
    { id: 'jobs', label: 'Jobs & Drives', count: tabCounts.jobs },
    { id: 'system', label: 'System', count: tabCounts.system },
  ]

  return (
    <main className="notifications-page" aria-label="Candidate Notifications & In-App Alerts">
      {/* Toast Notification */}
      {toastMessage && (
        <aside className="notif-toast" role="status" aria-live="polite">
          <span className="material-symbols-outlined" aria-hidden="true">
            notifications_active
          </span>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. Live Telemetry Strip */}
      {/* <section className="notif-telemetry-bar" aria-label="Notification Service Telemetry">
        <div className="notif-telemetry-left">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00418f', fontWeight: 600 }}>
            <span className="notif-pulse-dot" aria-hidden="true" />
            TALENT_WORKSPACE // NOTIFICATION-DISPATCH-V3.0
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span>
            DISPATCH ENGINE: <strong style={{ color: '#00418f' }}>APNs / FCM &amp; WEBHOOK STREAMING</strong>
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span>
            SYNC STATUS: <strong style={{ color: '#10b981' }}>REAL-TIME CONNECTED</strong>
          </span>
        </div>

        <div className="notif-telemetry-right">
          <span className="notif-telemetry-badge">
            MOBILE COMPLIANT (FLUTTER / REACT NATIVE)
          </span>
        </div>
      </section> */}

      {/* 2. Header Area */}
      <header className="notif-header-area">
        <div>
          <div className="notif-overline-badge">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">
              notifications
            </span>
            <span>RECRUITMENT ACTIVITY &amp; STATUS DISPATCH</span>
          </div>
          <h1 className="notif-header-title">Notifications &amp; Activity Stream</h1>
          <p className="notif-header-desc">
            Stay informed on scheduled interview defenses, recruiter communications, walk-in drives, and real-time application updates across top AEC studios.
          </p>
        </div>

        <div className="notif-header-actions">
          {/* <button
            type="button"
            className="btn-notif-secondary"
            onClick={handleSendTestNotification}
            title="Simulate incoming test notification"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              send_and_archive
            </span>
            <span>Test Dispatch</span>
          </button>

          <button
            type="button"
            className="btn-notif-secondary"
            onClick={() => {
              setModalPrefs(preferences)
              setIsPreferencesModalOpen(true)
            }}
            title="Configure notification channels and alerts"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              tune
            </span>
            <span>Alert Preferences</span>
          </button> */}

          <EnablePushButton />

          <button
            type="button"
            className="btn-notif-primary"
            onClick={handleMarkAllAsRead}
            disabled={metrics.unread === 0}
            style={{ opacity: metrics.unread === 0 ? 0.7 : 1 }}
            title="Mark all notifications as read"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              done_all
            </span>
            <span>Mark All Read</span>
          </button>
        </div>
      </header>

      {/* 3. KPI Metrics Grid */}
      <section className="notif-metrics-grid" aria-label="Notification Telemetry Summary">
        {/* Metric 1: Total */}
        <article className="notif-metric-card">
          <div className="notif-metric-top">
            <span className="notif-metric-label">Total Notifications</span>
            <div className="notif-metric-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                folder_open
              </span>
            </div>
          </div>
          <div className="notif-metric-value">{metrics.total}</div>
          <span className="notif-metric-subtext">Across all active recruitment channels</span>
        </article>

        {/* Metric 2: Unread */}
        <article className="notif-metric-card">
          <div className="notif-metric-top">
            <span className="notif-metric-label">Unread Alerts</span>
            <div className="notif-metric-icon-box unread">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                mark_email_unread
              </span>
            </div>
          </div>
          <div className="notif-metric-value" style={{ color: metrics.unread > 0 ? '#0058bc' : '#1a1c1e' }}>
            {metrics.unread}
          </div>
          <span className="notif-metric-subtext">Requires candidate attention</span>
        </article>

        {/* Metric 3: Urgent */}
        <article className="notif-metric-card">
          <div className="notif-metric-top">
            <span className="notif-metric-label">Urgent / Scheduled</span>
            <div className="notif-metric-icon-box urgent">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                priority_high
              </span>
            </div>
          </div>
          <div className="notif-metric-value" style={{ color: metrics.urgent > 0 ? '#dc2626' : '#1a1c1e' }}>
            {metrics.urgent}
          </div>
          <span className="notif-metric-subtext">Technical interview rounds pending</span>
        </article>

        {/* Metric 4: Past 24h */}
        <article className="notif-metric-card">
          <div className="notif-metric-top">
            <span className="notif-metric-label">Past 24 Hours</span>
            <div className="notif-metric-icon-box today">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                schedule
              </span>
            </div>
          </div>
          <div className="notif-metric-value" style={{ color: '#059669' }}>
            {metrics.todayCount}
          </div>
          <span className="notif-metric-subtext">New dispatches in last cycle</span>
        </article>
      </section>

      {/* 4. Controls & Filters Section */}
      <section className="notif-controls-section" aria-label="Notification Filters">
        {/* Category Tabs */}
        <nav className="notif-tabs-scroll" aria-label="Notification Category Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`notif-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.label}</span>
              <span className="notif-tab-count">{tab.count}</span>
            </button>
          ))}
        </nav>

        {/* Search & Actions Bar */}
        <div className="notif-filters-row">
          <div className="notif-search-box">
            <span className="material-symbols-outlined notif-search-icon" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              className="notif-search-input"
              placeholder="Search notifications by title, studio, or role..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              aria-label="Search notifications"
            />
            {searchQuery && (
              <button
                type="button"
                className="notif-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">
                  close
                </span>
              </button>
            )}
          </div>

          <div className="notif-filter-actions">
            <select
              className="notif-select-dropdown"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'all' | NotificationPriority)}
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Alerts Only</option>
              <option value="important">Important</option>
              <option value="normal">Normal</option>
            </select>

            <button
              type="button"
              className="btn-notif-ghost"
              onClick={handleClearAllRead}
              title="Delete all read notifications"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">
                delete_sweep
              </span>
              <span>Clear Read</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Notifications List */}
      <section className="notif-list-container" aria-label="Notifications Feed">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ height: '90px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '90px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '90px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite' }} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <article className="notif-empty-state">
            <div className="notif-empty-icon-box">
              <span className="material-symbols-outlined" aria-hidden="true">
                notifications_off
              </span>
            </div>
            <h3 className="notif-empty-title">No notifications found</h3>
            <p className="notif-empty-desc">
              {searchQuery || priorityFilter !== 'all' || activeTab !== 'all'
                ? 'No alerts match your active filter settings. Try adjusting search or category filter.'
                : 'You are completely caught up! New interview invites, recruiter inquiries, and status changes will appear here.'}
            </p>
            {(searchQuery || priorityFilter !== 'all' || activeTab !== 'all') && (
              <button
                type="button"
                className="btn-notif-secondary"
                onClick={() => {
                  setSearchQuery('')
                  setPriorityFilter('all')
                  setActiveTab('all')
                }}
              >
                Reset Filters
              </button>
            )}
          </article>
        ) : (
          filteredNotifications.map((item) => {
            const priority = item.metadata?.priority || 'normal'
            const company = item.metadata?.company_name
            const role = item.metadata?.role_title
            const relativeTime = formatRelativeTime(item.created_at)

            return (
              <article
                key={item.id}
                className={`notif-card ${!item.is_read ? 'unread' : ''}`}
                onClick={() => setSelectedNotificationForDetail(item)}
              >
                {/* Type Icon */}
                <div className="notif-card-icon-area">
                  <div className={`notif-type-icon ${item.type}`}>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {getTypeIcon(item.type)}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="notif-card-content">
                  {/* Meta Row */}
                  <div className="notif-card-meta-row">
                    {company && <span className="notif-company-chip">{company}</span>}
                    <span className={`notif-priority-chip ${priority}`}>{priority}</span>
                    <span className="notif-time-text">{relativeTime}</span>
                  </div>

                  {/* Title */}
                  <h2 className="notif-card-title">
                    {!item.is_read && <span className="notif-unread-dot" aria-label="Unread alert" />}
                    <span>{item.title}</span>
                  </h2>

                  {/* Body Text */}
                  <p className="notif-card-body">{item.body}</p>

                  {/* Extra Details / Context */}
                  {(role || item.metadata?.interview_time || item.metadata?.location || item.metadata?.salary_text) && (
                    <div className="notif-card-details-strip">
                      {role && (
                        <span className="notif-detail-item">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            badge
                          </span>
                          <span>{role}</span>
                        </span>
                      )}
                      {item.metadata?.interview_time && (
                        <span className="notif-detail-item">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            alarm
                          </span>
                          <span>
                            {item.metadata.interview_time} ({item.metadata.interview_format || 'Online'})
                          </span>
                        </span>
                      )}
                      {item.metadata?.location && (
                        <span className="notif-detail-item">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            pin_drop
                          </span>
                          <span>{item.metadata.location}</span>
                        </span>
                      )}
                      {item.metadata?.salary_text && (
                        <span className="notif-detail-item">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            payments
                          </span>
                          <span>{item.metadata.salary_text}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="notif-card-actions">
                    <button
                      type="button"
                      className="btn-notif-action"
                      onClick={(e) => handlePerformAction(item, e)}
                    >
                      <span>{getActionLabel(item)}</span>
                      <span className="material-symbols-outlined" aria-hidden="true">
                        arrow_forward
                      </span>
                    </button>

                    <div className="notif-quick-tools">
                      <button
                        type="button"
                        className="btn-notif-icon-tool"
                        onClick={(e) => handleToggleRead(item.id, e)}
                        title={item.is_read ? 'Mark as Unread' : 'Mark as Read'}
                        aria-label={item.is_read ? 'Mark as Unread' : 'Mark as Read'}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          {item.is_read ? 'mark_chat_unread' : 'mark_chat_read'}
                        </span>
                      </button>

                      <button
                        type="button"
                        className="btn-notif-icon-tool danger"
                        onClick={(e) => handleDeleteNotification(item.id, e)}
                        title="Delete notification"
                        aria-label="Delete notification"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </section>

      {/* 6. Notification Details Inspection Modal */}
      {selectedNotificationForDetail && (
        <aside
          className="notif-modal-backdrop"
          onClick={() => setSelectedNotificationForDetail(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Notification Details Modal"
        >
          <div className="notif-modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="notif-modal-header">
              <div className="notif-modal-header-left">
                <div className={`notif-type-icon ${selectedNotificationForDetail.type}`} style={{ width: '36px', height: '36px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }} aria-hidden="true">
                    {getTypeIcon(selectedNotificationForDetail.type)}
                  </span>
                </div>
                <h3 className="notif-modal-title">Notification Inspection</h3>
              </div>
              <button
                type="button"
                className="notif-modal-close-btn"
                onClick={() => setSelectedNotificationForDetail(null)}
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </header>

            <div className="notif-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className={`notif-priority-chip ${selectedNotificationForDetail.metadata?.priority || 'normal'}`}>
                  {selectedNotificationForDetail.metadata?.priority || 'normal'} Priority
                </span>
                <span style={{ fontSize: '12px', color: '#727784', marginLeft: 'auto' }}>
                  Dispatched: {new Date(selectedNotificationForDetail.created_at).toLocaleString('en-IN')}
                </span>
              </div>

              <h4 style={{ margin: '0', fontSize: '18px', fontWeight: 700, color: '#1a1c1e' }}>
                {selectedNotificationForDetail.title}
              </h4>

              <div className="notif-modal-desc-box">
                {selectedNotificationForDetail.body}
              </div>

              {/* Structured Metadata Grid */}
              <div className="notif-modal-meta-grid">
                <div>
                  <div className="notif-modal-meta-label">Associated Studio / Entity</div>
                  <div className="notif-modal-meta-value">
                    {selectedNotificationForDetail.metadata?.company_name || 'Castallio One Core'}
                  </div>
                </div>

                <div>
                  <div className="notif-modal-meta-label">Dispatched Channel</div>
                  <div className="notif-modal-meta-value">
                    In-App &amp; Push Webhook
                  </div>
                </div>

                <div>
                  <div className="notif-modal-meta-label">Target Workflow</div>
                  <div className="notif-modal-meta-value" style={{ textTransform: 'capitalize' }}>
                    {selectedNotificationForDetail.type} Hub
                  </div>
                </div>

                <div>
                  <div className="notif-modal-meta-label">Status</div>
                  <div className="notif-modal-meta-value" style={{ color: selectedNotificationForDetail.is_read ? '#059669' : '#0058bc' }}>
                    {selectedNotificationForDetail.is_read ? 'Marked Read' : 'Unread Alert'}
                  </div>
                </div>
              </div>
            </div>

            <footer className="notif-modal-footer">
              <button
                type="button"
                className="btn-notif-secondary"
                onClick={() => setSelectedNotificationForDetail(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-notif-primary"
                onClick={() => {
                  const target = selectedNotificationForDetail
                  setSelectedNotificationForDetail(null)
                  handlePerformAction(target)
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  open_in_new
                </span>
                <span>{getActionLabel(selectedNotificationForDetail)}</span>
              </button>
            </footer>
          </div>
        </aside>
      )}

      {/* 7. Notification Preferences Settings Modal */}
      {isPreferencesModalOpen && (
        <aside
          className="notif-modal-backdrop"
          onClick={() => setIsPreferencesModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Notification Delivery Preferences"
        >
          <div className="notif-modal-card" onClick={(e) => e.stopPropagation()}>
            <header className="notif-modal-header">
              <div className="notif-modal-header-left">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">
                  tune
                </span>
                <h3 className="notif-modal-title">Notification Delivery Channels</h3>
              </div>
              <button
                type="button"
                className="notif-modal-close-btn"
                onClick={() => setIsPreferencesModalOpen(false)}
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </header>

            <div className="notif-modal-body">
              <p style={{ margin: 0, fontSize: '13px', color: '#555b68' }}>
                Control how and when recruitment updates, interview calls, and walk-in drives reach your devices. Synchronized with your Castallio One mobile app preferences.
              </p>

              <div className="notif-pref-list">
                {/* Pref 1: Push Notifications */}
                <div className="notif-pref-item">
                  <div className="notif-pref-info">
                    <span className="notif-pref-title">Native Push Notifications</span>
                    <span className="notif-pref-desc">Receive real-time pop-ups on mobile devices (APNs / FCM) and browser tabs</span>
                  </div>
                  <label className="notif-switch" aria-label="Toggle native push notifications">
                    <input
                      type="checkbox"
                      checked={modalPrefs.pushEnabled}
                      onChange={(e) => setModalPrefs({ ...modalPrefs, pushEnabled: e.target.checked })}
                    />
                    <span className="notif-slider" />
                  </label>
                </div>

                {/* Pref 2: Technical Interview Reminders */}
                <div className="notif-pref-item">
                  <div className="notif-pref-info">
                    <span className="notif-pref-title">Technical Interview Alerts &amp; Calendar Invites</span>
                    <span className="notif-pref-desc">Urgent reminders 24h and 1h prior to technical defenses and scheduled slots</span>
                  </div>
                  <label className="notif-switch" aria-label="Toggle interview alerts">
                    <input
                      type="checkbox"
                      checked={modalPrefs.interviewReminders}
                      onChange={(e) => setModalPrefs({ ...modalPrefs, interviewReminders: e.target.checked })}
                    />
                    <span className="notif-slider" />
                  </label>
                </div>

                {/* Pref 3: Application Status Changes */}
                <div className="notif-pref-item">
                  <div className="notif-pref-info">
                    <span className="notif-pref-title">Application Status Tracking</span>
                    <span className="notif-pref-desc">Instant alerts when your profile is shortlisted, reviewed, or offered</span>
                  </div>
                  <label className="notif-switch" aria-label="Toggle application status tracking">
                    <input
                      type="checkbox"
                      checked={modalPrefs.applicationStatusUpdates}
                      onChange={(e) => setModalPrefs({ ...modalPrefs, applicationStatusUpdates: e.target.checked })}
                    />
                    <span className="notif-slider" />
                  </label>
                </div>

                {/* Pref 4: Recruiter Direct Inquiries */}
                <div className="notif-pref-item">
                  <div className="notif-pref-info">
                    <span className="notif-pref-title">Direct Studio Recruiter Inquiries</span>
                    <span className="notif-pref-desc">Immediate alerts when a verified employer sends a direct chat message</span>
                  </div>
                  <label className="notif-switch" aria-label="Toggle recruiter direct inquiries">
                    <input
                      type="checkbox"
                      checked={modalPrefs.recruiterDirectMessages}
                      onChange={(e) => setModalPrefs({ ...modalPrefs, recruiterDirectMessages: e.target.checked })}
                    />
                    <span className="notif-slider" />
                  </label>
                </div>

                {/* Pref 5: Walk-in Drives */}
                <div className="notif-pref-item">
                  <div className="notif-pref-info">
                    <span className="notif-pref-title">Walk-in Drive &amp; Campus Invitations</span>
                    <span className="notif-pref-desc">Targeted invitations to regional walk-in hiring drives matching your discipline</span>
                  </div>
                  <label className="notif-switch" aria-label="Toggle walk-in drive alerts">
                    <input
                      type="checkbox"
                      checked={modalPrefs.walkInDriveAlerts}
                      onChange={(e) => setModalPrefs({ ...modalPrefs, walkInDriveAlerts: e.target.checked })}
                    />
                    <span className="notif-slider" />
                  </label>
                </div>

                {/* Pref 6: Job Recommendations */}
                <div className="notif-pref-item">
                  <div className="notif-pref-info">
                    <span className="notif-pref-title">AI Opportunity Match Digests</span>
                    <span className="notif-pref-desc">Curated AEC opportunities matching &gt;90% compatibility with your skill blueprint</span>
                  </div>
                  <label className="notif-switch" aria-label="Toggle job recommendations">
                    <input
                      type="checkbox"
                      checked={modalPrefs.jobRecommendations}
                      onChange={(e) => setModalPrefs({ ...modalPrefs, jobRecommendations: e.target.checked })}
                    />
                    <span className="notif-slider" />
                  </label>
                </div>
              </div>
            </div>

            <footer className="notif-modal-footer">
              <button
                type="button"
                className="btn-notif-secondary"
                onClick={() => setIsPreferencesModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-notif-primary"
                onClick={() => handleSavePreferences(modalPrefs)}
              >
                Save Preferences
              </button>
            </footer>
          </div>
        </aside>
      )}
    </main>
  )
}

export default Notifications
