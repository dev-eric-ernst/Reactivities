import { RootStore } from './rootStore'
import { observable, runInAction, action, computed } from 'mobx'
import agent from '../api/agent'
import { IProfile, IPhoto } from '../models/profile'
import { toast } from 'react-toastify'

export default class ProfileStore {
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore
  }

  @observable profile: IProfile | null = null
  @observable loadingProfile = true
  @observable uploadingPhoto = false
  @observable loading = false
  @observable deleting = false

  @computed get isCurrentUser() {
    if (this.rootStore.userStore.user && this.profile) {
      return this.rootStore.userStore.user.username === this.profile.username
    } else {
      return false
    }
  }

  @action loadProfile = async (username: string) => {
    this.loadingProfile = true
    try {
      const profile = await agent.Profiles.get(username)
      runInAction('loading profile', () => {
        this.profile = profile
        this.loadingProfile = false
      })
    } catch (error) {
      runInAction('load profile error', () => {
        this.loadingProfile = false
      })
      console.log(error)
    }
  }

  @action uploadPhoto = async (file: Blob) => {
    this.uploadingPhoto = true
    try {
      const photo = await agent.Profiles.uploadPhoto(file)
      runInAction('uploading photo', () => {
        if (this.profile) {
          this.profile.photos.push(photo)
          if (photo.isMain && this.rootStore.userStore.user) {
            this.rootStore.userStore.user.image = photo.url
            this.profile.image = photo.url
          }
        }
        this.uploadingPhoto = false
      })
    } catch (error) {
      console.log(error)
      toast.error('Problem uploading photo')
      runInAction('upload photo error', () => {
        this.uploadingPhoto = false
      })
    }
  }

  @action setMainPhoto = async (photo: IPhoto) => {
    this.loading = true
    try {
      await agent.Profiles.setMainPhoto(photo.id)
      runInAction('setting main photo', () => {
        if (this.profile) {
          this.rootStore.userStore.user!.image = photo.url
          this.profile.photos.find((p) => p.isMain)!.isMain = false
          this.profile.photos.find((p) => p.id === photo.id)!.isMain = true
          this.profile.image = photo.url
        }
        this.loading = false
      })
    } catch (error) {
      console.log(error)
      toast.error('Problem setting main photo')
      runInAction('set main photo error', () => {
        this.loading = false
      })
    }
  }

  @action deletePhoto = async (photo: IPhoto) => {
    this.deleting = true
    try {
      await agent.Profiles.deletePhoto(photo.id)
      runInAction('deleting photo', () => {
        if (this.profile) {
          this.profile.photos = this.profile.photos.filter(
            (p) => p.id !== photo.id
          )
        }
        this.deleting = false
      })
    } catch (error) {
      console.log(error)
      toast.error('Problem deleting photo')
      runInAction('set main photo error', () => {
        this.deleting = false
      })
    }
  }
}
