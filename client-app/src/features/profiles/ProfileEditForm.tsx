import React from 'react'
import { Segment, Form, Button, Tab } from 'semantic-ui-react'
import { IProfileDetails, IProfile } from '../../app/models/profile'
import { Form as FinalForm, Field } from 'react-final-form'
import TextInput from '../../app/common/form/TextInput'
import TextAreaInput from '../../app/common/form/TextAreaInput'
import { combineValidators, isRequired } from 'revalidate'

interface IProps {
  profile: IProfile | null
  loading: boolean
  editPhoto: (details: any) => void
}

const validate = combineValidators({
  displayName: isRequired({ message: 'A display name is required' }),
})

const ProfileEditForm: React.FC<IProps> = ({ profile, loading, editPhoto }) => {
  const profileDetails: IProfileDetails = {
    displayName: profile!.displayName,
    bio: profile!.bio,
  }

  return (
    <Tab.Pane style={{ border: '0px', padding: '0px' }}>
      <FinalForm
        initialValues={profileDetails}
        validate={validate}
        onSubmit={editPhoto}
        render={({ handleSubmit, invalid, pristine }) => (
          <Segment style={{ border: '0px', padding: '0px' }} clearing>
            <Form
              style={{ border: '0px', padding: '0px' }}
              onSubmit={handleSubmit}
            >
              <Field
                component={TextInput}
                name="displayName"
                placeholder="Display Name"
                value={profileDetails.displayName}
              />
              <Field
                component={TextAreaInput}
                name="bio"
                placeholder="Bio"
                rows={3}
                value={profileDetails.bio}
              />
              <Button
                loading={loading}
                disabled={loading || invalid || pristine}
                floated="right"
                positive
                type="submit"
                content="Submit"
              />
            </Form>
          </Segment>
        )}
      />
    </Tab.Pane>
  )
}

export default ProfileEditForm
