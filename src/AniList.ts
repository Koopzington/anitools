class AniList extends EventTarget {
  private readonly userQuery = `
    query ($userName: String) {
      User (name: $userName) {
        id
        name
      }
    }`

  private readonly authenticatedUserquery = `
    query {
      Viewer {
        id
        name
      }
    }`

  private accessToken: string | null = null

  public readonly setAccessToken = (accessToken: string | null) => {
    this.accessToken = accessToken;
    if (accessToken === null) {
      this.dispatchEvent(new Event('user-logged-out'))
    } else {
      this.dispatchEvent(new Event('user-logged-in'))
    }
  }

  public readonly request = async (query, variables = {}): Promise<any> => {
    const url = 'https://graphql.anilist.co'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    }

    // Add Authorization header if access token is set
    if (this.accessToken !== null) {
      options.headers['Authorization'] = 'Bearer ' +  this.accessToken
    }

    const response = await fetch(url, options)

    return await response.json()
  }

  public readonly isLoggedIn = () => {
    return this.accessToken !== null
  }

  public readonly getUserInfo = async (userName: string): Promise<ALUserInfo | undefined> => {
    if (userName.length === 0 && this.accessToken === null) {
      return undefined
    }

    let query = this.userQuery
    let variables = {}
    if (this.accessToken !== null && userName === null) {
      query = this.authenticatedUserquery
    }
    if (userName.length > 0) {
      variables.userName = userName
    }

    const response = await this.request(query, variables)

    if (! Object.hasOwn(response, 'data')) {
      return undefined
    }

    if (userName.length > 0) {
      // If the user wasn't found response.data.User will contain null
      return response.data.User as ALUserInfo
    }

    return response.data.Viewer as ALUserInfo
  }
}

export default AniList
