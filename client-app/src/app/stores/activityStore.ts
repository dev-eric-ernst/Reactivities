import { observable, action, computed, configure, runInAction } from 'mobx'
import { createContext, SyntheticEvent } from 'react'
import { IActivity } from '../models/activity'
import agent from '../api/agent'

configure({ enforceActions: 'always' })

class ActivityStore {
  @observable activityRegistry = new Map<string, IActivity>()
  @observable activity: IActivity | null = null
  @observable loadingInitial = false
  @observable submitting = false
  @observable target = ''

  @computed get activitiesByDate() {
    return this.groupActivitiesByDate(
      Array.from(this.activityRegistry.values())
    )
  }

  groupActivitiesByDate(activities: IActivity[]) {
    const sortedActivities: IActivity[] = activities.sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    )

    return Object.entries(
      sortedActivities.reduce((activities, activity) => {
        const date = activity.date.split('T')[0]
        if (!activities[date]) activities[date] = []
        activities[date].push(activity)
        return activities
      }, {} as { [key: string]: IActivity[] })
    )
  }

  @action loadActivities = async () => {
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

  @action loadActivity = async (id: string) => {
    let activity = this.getActivity(id)
    if (activity) {
      this.activity = activity
    } else {
      this.loadingInitial = true
      try {
        activity = await agent.Activities.details(id)
        runInAction('loading activity', () => (this.activity = activity))
      } catch (error) {
        console.error(error)
      } finally {
        runInAction(
          'load activity finally',
          () => (this.loadingInitial = false)
        )
      }
    }
  }

  @action clearActivity = () => (this.activity = null)

  getActivity = (id: string | null): IActivity | null => {
    let activity = id ? this.activityRegistry.get(id) : null
    activity = activity ? activity : null
    return activity
  }

  @action createActivity = async (activity: IActivity) => {
    this.submitting = true
    try {
      await agent.Activities.create(activity)
      runInAction('creating activity', () => {
        this.activityRegistry.set(activity.id, activity)
        this.activity = activity
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction('create activity error', () => (this.submitting = false))
    }
  }

  @action editActivity = async (activity: IActivity) => {
    this.submitting = true
    try {
      await agent.Activities.update(activity)
      runInAction('editing activity', () => {
        this.activityRegistry.set(activity.id, activity)
        this.activity = activity
      })
    } catch (error) {
      console.error(error)
    } finally {
      runInAction('edit activity error', () => (this.submitting = false))
    }
  }

  @action deleteActivity = async (
    event: SyntheticEvent<HTMLButtonElement>,
    id: string
  ) => {
    this.submitting = true
    this.target = event.currentTarget.name
    try {
      await agent.Activities.delete(id)
      runInAction('deleting activity', () => {
        this.activityRegistry.delete(id)
        if (this.activity && this.activity.id === id) {
          this.activity = null
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
}

export default createContext(new ActivityStore())
