export interface IUser {
  username: string
  displayName: string
  token: string
  image?: string
}

export interface IUserFormValues {
  email: string
  password: string
  username?: string
  displayName?: string
}
