import { observable, action, computed, configure, runInAction } from 'mobx'
import { createContext, SyntheticEvent } from 'react'
import { IActivity } from '../models/activity'
import agent from '../api/agent'

configure({ enforceActions: 'always' })

class ActivityStore {
  @observable activityRegistry = new Map()
  @observable activities: IActivity[] = []
  @observable selectedActivity: IActivity | undefined
  @observable loadingInitial = false
  @observable editMode = false
  @observable submitting = false
  @observable target = ''

  @computed get activitiesByDate() {
    return Array.from(this.activityRegistry.values()).sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    )
  }
  @action async loadActivities() {
    this.loadingInitial = true
    try {
      const activities = await agent.Activities.list()
      runInAction('loading activities', () => {
        activities.forEach((activity) => {
          activity.date = activity.date.split('.')[0]
          this.activityRegistry.set(activity.id, activity)
        })
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction('load activities error', () => (this.loadingInitial = false))
    }
  }

  @action.bound async createActivity(activity: IActivity) {
    this.submitting = true
    try {
      await agent.Activities.create(activity)
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity)
        this.selectedActivity = activity
        this.editMode = false
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction('create activity error', () => (this.submitting = false))
    }
  }

  @action.bound async editActivity(activity: IActivity) {
    this.submitting = true
    try {
      await agent.Activities.update(activity)
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity)
        this.selectedActivity = activity
        this.editMode = false
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction('edit activity error', () => (this.submitting = false))
    }
  }

  @action.bound async deleteActivity(
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) {
    this.submitting = true
    this.target = event.currentTarget.name
    try {
      await agent.Activities.delete(id)
      runInAction('deleting activity', () => {
        this.activityRegistry.delete(id)
        if (this.selectedActivity && this.selectedActivity.id === id) {
          this.selectedActivity = undefined
          this.editMode = false
        }
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction('delete activity finally', () => {
        this.target = ''
        this.submitting = false
      })
    }
  }
  @action openCreateForm = () => {
    this.editMode = true
    this.selectedActivity = undefined
  }

  @action.bound openEditForm(id: string) {
    this.selectedActivity = this.activityRegistry.get(id)
    this.editMode = true
  }

  @action.bound cancelSelectedActivity() {
    this.selectedActivity = undefined
  }

  @action.bound cancelFormOpen() {
    this.editMode = false
  }

  @action.bound selectActivity(id: string | null) {
    this.selectedActivity = id ? this.activityRegistry.get(id) : undefined
    this.editMode = false
  }
}

export default createContext(new ActivityStore())
