import React, { useContext, useState } from 'react'
import { Tab, Grid, Button, Header } from 'semantic-ui-react'
import { observer } from 'mobx-react-lite'
import { RootStoreContext } from '../../app/stores/rootStore'
import ProfileEditForm from './ProfileEditForm'
import { IProfileDetails } from '../../app/models/profile'

const ProfileDescription = () => {
  const rootStore = useContext(RootStoreContext)
  const {
    isCurrentUser,
    profile,
    loading,
    editProfile,
  } = rootStore.profileStore
  const [editMode, setEditMode] = useState(false)

  const handleDetailsForm = (values: any) => {
    const details: IProfileDetails = {
      displayName: values.displayName,
      bio: values.bio,
    }

    editProfile(details).then(() => setEditMode(false))
  }

  return (
    <Tab.Pane>
      <Grid>
        <Grid.Column width={16} style={{ paddingBottom: 0 }}>
          <Header
            floated="left"
            icon="user"
            content={'About ' + profile?.displayName}
          />
          {isCurrentUser && (
            <Button
              floated="right"
              basic
              content={editMode ? 'Cancel' : 'Edit Profile'}
              onClick={() => setEditMode(!editMode)}
            />
          )}
        </Grid.Column>
        <Grid.Column width={16}>
          {editMode ? (
            <ProfileEditForm
              profile={profile}
              loading={loading}
              editPhoto={handleDetailsForm}
            />
          ) : (
            <p>{profile?.bio ? profile.bio : 'No details provided'}</p>
          )}
        </Grid.Column>
      </Grid>
    </Tab.Pane>
  )
}

export default observer(ProfileDescription)
