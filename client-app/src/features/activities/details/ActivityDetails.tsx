import React, { useContext, useEffect } from 'react'
import { Grid } from 'semantic-ui-react'
import { observer } from 'mobx-react-lite'
import { RootStoreContext } from '../../../app/stores/rootStore'
import { RouteComponentProps } from 'react-router-dom'
import LoadingComponent from '../../../app/layout/LoadingComponent'
import ActivityDetailedHeader from './ActivityDetailedHeader'
import ActivityDetatiledInfo from './ActivityDetatiledInfo'
import ActivityDetailedChat from './ActivityDetailedChat'
import ActivityDetailedSidebar from './ActivityDetailedSidebar'

interface DetailParams {
  id: string
}
const ActivityDetails: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
}) => {
  const rootStore = useContext(RootStoreContext)
  const { activity, loadActivity, loadingInitial } = rootStore.activityStore

  useEffect(() => {
    loadActivity(match.params.id)
  }, [loadActivity, match.params.id])

  if (loadingInitial)
    return <LoadingComponent>Loading activity...</LoadingComponent>

  if (!activity) return <h2>Activity not found</h2>
  return (
    <Grid>
      <Grid.Column width={10}>
        <ActivityDetailedHeader activity={activity} />
        <ActivityDetatiledInfo activity={activity} />
        <ActivityDetailedChat />
      </Grid.Column>
      <Grid.Column width={6}>
        <ActivityDetailedSidebar attendees={activity.attendees} />
      </Grid.Column>
    </Grid>
  )
}

export default observer(ActivityDetails)
