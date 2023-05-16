/* global localStorage */

class Settings extends EventTarget {
  private useTagGroups: boolean
  private useEmbedsForCodeCopy: boolean

  public initSettings () {
    this.initFatFreeMode()
    this.initIWannaReadOn4kHalfsize()
    this.initTheme()
    this.initSideBarPosition()
    this.initTagGroups()
    this.initCodeCopyBehaviour()
  }

  private initFatFreeMode = () => {
    document.querySelector('#fat-free-toggle').addEventListener('click', () => {
      document.querySelector('html').classList.toggle('fat-free')
      const state = document.querySelector('html').classList.contains('fat-free')
      document.querySelector('#fat-free-toggle').classList.toggle('btn-primary', state)
      localStorage.setItem('settings-fat-free', state.toString())
    })
    const fatFreeEnabled = localStorage.getItem('settings-fat-free')
    if (fatFreeEnabled !== null) {
      document.querySelector('html').classList.toggle('fat-free', fatFreeEnabled === 'true')
      document.querySelector('#fat-free-toggle').classList.toggle('btn-primary', fatFreeEnabled === 'true')
    }
  }

  private initIWannaReadOn4kHalfsize = () => {
    document.querySelector('#four-k-halfsize-toggle').addEventListener('click', () => {
      document.querySelector('html').classList.toggle('i-wanna-read-on-4k-halfsize')
      const state = document.querySelector('html').classList.contains('i-wanna-read-on-4k-halfsize')
      document.querySelector('#four-k-halfsize-toggle').classList.toggle('btn-primary', state)
      localStorage.setItem('settings-4k-halfsize', state.toString())
    })
    const fourkhalfsize = localStorage.getItem('settings-4k-halfsize')
    if (fourkhalfsize !== null) {
      document.querySelector('html').classList.toggle('i-wanna-read-on-4k-halfsize', fourkhalfsize === 'true')
      document.querySelector('#four-k-halfsize-toggle').classList.toggle('btn-primary', fourkhalfsize === 'true')
    }
  }

  private initTheme = () => {
    const siteThemeSelect: HTMLSelectElement = document.querySelector('#site-theme')
    const enableTheme = (theme) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.classList.add('site-theme')
      link.href = 'themes/' + theme + '.css'
      document.querySelector('head').appendChild(link)
    }
    siteThemeSelect.addEventListener('change', () => {
      document.querySelectorAll('.site-theme').forEach((e) => {
        e.remove()
      })

      if (siteThemeSelect.value === '') {
        localStorage.removeItem('site-theme')
        return
      }

      enableTheme(siteThemeSelect.value)
      localStorage.setItem('site-theme', siteThemeSelect.value)
    })
    const siteTheme = localStorage.getItem('site-theme')
    if (siteTheme !== null) {
      enableTheme(siteTheme)
      siteThemeSelect.value = siteTheme
    }
  }

  private initSideBarPosition = () => {
    const sideBarPositionSelect: HTMLSelectElement = document.querySelector('#sidebar-position')
    const moveSideBarToRightSide = () => {
      document.querySelector('html').classList.toggle('sidebar-right', sideBarPositionSelect.value === 'right')
    }

    sideBarPositionSelect.addEventListener('change', () => {
      moveSideBarToRightSide()
      localStorage.setItem('settings-sidebar-position', sideBarPositionSelect.value)
    })

    const sidebarPosition = localStorage.getItem('settings-sidebar-position')
    if (sidebarPosition !== null) {
      sideBarPositionSelect.value = sidebarPosition
    }
    moveSideBarToRightSide()
  }

  private initTagGroups = () => {
    this.useTagGroups = localStorage.getItem('settings-use-tag-groups') === 'true'

    document.querySelector('#use-tag-groups').addEventListener('click', () => {
      this.useTagGroups = !this.useTagGroups
      document.querySelector('#use-tag-groups').classList.toggle('btn-primary', this.useTagGroups)
      localStorage.setItem('settings-use-tag-groups', this.useTagGroups.toString())
      this.dispatchEvent(new Event('tag-grouping-updated'))
    })
    document.querySelector('#use-tag-groups').classList.toggle('btn-primary', this.useTagGroups)
  }

  public shouldGroupTags = () => this.useTagGroups

  private initCodeCopyBehaviour = () => {
    this.useEmbedsForCodeCopy = localStorage.getItem('settings-use-embeds-for-code-copy') === 'true'

    document.querySelector('#use-embeds-for-code-copy').addEventListener('click', () => {
      this.useEmbedsForCodeCopy = !this.useEmbedsForCodeCopy
      document.querySelector('#use-embeds-for-code-copy').classList.toggle('btn-primary', this.useEmbedsForCodeCopy)
      localStorage.setItem('settings-use-embeds-for-code-copy', this.useEmbedsForCodeCopy.toString())
    })
    document.querySelector('#use-embeds-for-code-copy').classList.toggle('btn-primary', this.useEmbedsForCodeCopy)
  }

  public shouldUseEmbedsForCodeCopy = () => this.useEmbedsForCodeCopy
}

export default Settings
