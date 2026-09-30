import type { FC } from 'react'
import Notifications, { type NotificationsProps } from './Notifications'

export interface JobAlertsProps extends NotificationsProps {}

/**
 * JobAlerts has been replaced by the Notifications feature to align with
 * the mobile app system design and real-time candidate communication workflows.
 */
const JobAlerts: FC<JobAlertsProps> = (props) => {
  return <Notifications {...props} />
}

export default JobAlerts
