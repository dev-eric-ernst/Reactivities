import { RootStore } from './rootStore'
import { observable, runInAction, action, computed, reaction } from 'mobx'
import agent from '../api/agent'
import { IProfile, IPhoto, IProfileDetails } from '../models/profile'
import { toast } from 'react-toastify'

export default class ProfileStore {
  rootStore: RootStore

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore

    reaction(
      () => this.activeTab,
      (activeTab) => {
        if (activeTab === 3 || activeTab === 4) {
          const predicate = activeTab === 3 ? 'followers' : 'following'
          this.loadFollowings(predicate)
        } else {
          this.followings = []
        }
      }
    )

    reaction(
      () => {
        if (this.profile) {
          return this.profile.following
        }
      },
      () => {
        if (this.activeTab === 3) {
          this.loadFollowings('followers')
        }
      }
    )
  }

  @observable profile: IProfile | null = null
  @observable loadingProfile = true
  @observable uploadingPhoto = false
  @observable loading = false
  @observable deleting = false
  @observable followings: IProfile[] = []
  @observable activeTab: number = 0
  @observable followingsLoading = false

  @computed get isCurrentUser() {
    if (this.rootStore.userStore.user && this.profile) {
      return this.rootStore.userStore.user.username === this.profile.username
    } else {
      return false
    }
  }

  @action setActiveTab = (activeIndex: number) => {
    this.activeTab = activeIndex
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

  @action editProfile = async (profileDetails: IProfileDetails) => {
    this.loading = true
    try {
      await agent.Profiles.edit(profileDetails)
      runInAction('editing profile', () => {
        if (this.profile) {
          if (
            this.rootStore.userStore.user!.displayName !==
            profileDetails.displayName
          ) {
            this.rootStore.userStore.user!.displayName =
              profileDetails.displayName
          }
          this.profile.displayName = profileDetails.displayName
          this.profile.bio = profileDetails.bio
        }
        this.loading = false
      })
    } catch (error) {
      console.log(error)
      toast.error('Problem editing profile')
      runInAction('edit profile error', () => {
        this.loading = false
      })
    }
  }

  @action follow = async (username: string) => {
    this.loading = true
    try {
      await agent.Profiles.follow(username)
      runInAction('following', () => {
        this.profile!.following = true
        this.profile!.followingCount++
        this.loading = false
      })
    } catch (error) {
      toast.error('Problem following user')
      runInAction('error following', () => {
        this.loading = false
      })
    }
  }

  @action unfollow = async (username: string) => {
    this.loading = true
    try {
      await agent.Profiles.unfollow(username)
      runInAction('unfollowing', () => {
        this.profile!.following = false
        this.profile!.followingCount--
        this.loading = false
      })
    } catch (error) {
      toast.error('Problem unfollowing user')
      runInAction('error unfollowing', () => {
        this.loading = false
      })
    }
  }

  @action loadFollowings = async (predicate: string) => {
    this.followingsLoading = true
    try {
      const profiles = await agent.Profiles.listFollowings(
        this.profile!.username,
        predicate
      )
      runInAction('load followings', () => {
        this.followings = profiles
        this.followingsLoading = false
      })
    } catch (error) {
      console.log(error)
      toast.error('Problem loading followings')
      runInAction('error loading followings', () => {
        this.followingsLoading = false
      })
    }
  }
}
