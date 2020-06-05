import React, { useContext } from 'react'
import { Tab, Grid, Header, Card } from 'semantic-ui-react'
import { RootStoreContext } from '../../app/stores/rootStore'
import ProfileCard from './ProfileCard'
import { observer } from 'mobx-react-lite'

const ProfileFollowings = () => {
  const rootStore = useContext(RootStoreContext)
  const {
    profile,
    followings,
    followingsLoading,
    activeTab,
  } = rootStore.profileStore

  return (
    <Tab.Pane loading={followingsLoading}>
      <Grid>
        <Grid.Column width={16}>
          <Header
            floated="left"
            icon="user"
            content={
              activeTab === 3
                ? `People following ${profile!.displayName}`
                : `People ${profile!.displayName} is following`
            }
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Card.Group itemsPerRow={5}>
            {followings.map((profile) => (
              <ProfileCard profile={profile} key={profile.username} />
            ))}
          </Card.Group>
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  )
}

export default observer(ProfileFollowings)
