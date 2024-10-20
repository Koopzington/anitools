import AniTools from "../AniTools"
import Filters from "Filters"
import Tool from "Interfaces/Tool"
import { on } from "../commonLib"
import { Api } from "datatables.net"
import DataTable from "datatables.net-dt"

class Mapper implements Tool {
  private readonly mediaTypeSelect: HTMLSelectElement = document.querySelector('.media-type')!
  private AniTools: AniTools
  private Filters: Filters

  // Thess maps are for highlighting to work on differences between normal characters and full-width versions
  // This one contains characters that may or may not be present on both sides
  private optionalCharacterMapping: Array<Array<string>> = [
    ['\\|', '｜'],
    ['\\(', '（'],
    ['\\)', '）'],
    ['\\?', '？'],
    ['\\[', '［'],
    // ['\\\\', '＼'], // There's currently no manga that has backslashes in it's native title which is a good thing
    ['\\]', '］'],
    ['\\.', '．'],
    ['\\^', '＾'],
    ['\\+', '＋'],
    ['\\/', '／'],
    ['\\$', '＄'],
    ['!', '！'],
    ['·', '・'],
    ['"', '＂'],
    ['#', '＃'],
    ['%', '％'],
    ['&', '＆'],
    ["'", "＇"],
    ['\\*', '＊'],
    [',', '，', '、'],
    ['-', '－'],
    ['{', '｛'],
    ['}', '｝'],
    ['~', '～'],
    [':', '：'],
    [';', '；'],
    ['<', '＜'],
    ['=', '＝'],
    ['>', '＞'],
    ['@', '＠'],
    ['_', '＿'],
    ['`', '｀'],
  ]

  // This one contaains characters that are very likely to be present on both sides
  private requiredCharacterMapping: Array<Array<string>> = [
    ['0', '０'],
    ['1', '１'],
    ['2', '２'],
    ['3', '３'],
    ['4', '４'],
    ['5', '５'],
    ['6', '６'],
    ['7', '７'],
    ['8', '８'],
    ['9', '９'],
    ['A', 'Ａ'],
    ['B', 'Ｂ'],
    ['C', 'Ｃ'],
    ['D', 'Ｄ'],
    ['E', 'Ｅ'],
    ['F', 'Ｆ'],
    ['G', 'Ｇ'],
    ['H', 'Ｈ'],
    ['I', 'Ｉ'],
    ['J', 'Ｊ'],
    ['K', 'Ｋ'],
    ['L', 'Ｌ'],
    ['M', 'Ｍ'],
    ['N', 'Ｎ'],
    ['O', 'Ｏ'],
    ['P', 'Ｐ'],
    ['Q', 'Ｑ'],
    ['R', 'Ｒ'],
    ['S', 'Ｓ'],
    ['T', 'Ｔ'],
    ['U', 'Ｕ'],
    ['V', 'Ｖ'],
    ['W', 'Ｗ'],
    ['X', 'Ｘ'],
    ['Y', 'Ｙ'],
    ['Z', 'Ｚ'],
    ['a', 'ａ'],
    ['b', 'ｂ'],
    ['c', 'ｃ'],
    ['d', 'ｄ'],
    ['e', 'ｅ'],
    ['f', 'ｆ'],
    ['g', 'ｇ'],
    ['h', 'ｈ'],
    ['i', 'ｉ'],
    ['j', 'ｊ'],
    ['k', 'ｋ'],
    ['l', 'ｌ'],
    ['m', 'ｍ'],
    ['n', 'ｎ'],
    ['o', 'ｏ'],
    ['p', 'ｐ'],
    ['q', 'ｑ'],
    ['r', 'ｒ'],
    ['s', 'ｓ'],
    ['t', 'ｔ'],
    ['u', 'ｕ'],
    ['v', 'ｖ'],
    ['w', 'ｗ'],
    ['x', 'ｘ'],
    ['y', 'ｙ'],
    ['z', 'ｚ'],
  ]

  private readonly infoModal = `
    <div class="modal" id="mapping-info-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content" style="width: 50em;">
          <a href="#" class="close" role="button" aria-label="Close">
              <span aria-hidden="true">×</span>
          </a>
          <h5 class="modal-title">Notes for mapping manga from AniList to MangaUpdates:</h5>
          <ul>
            <li>The order in which AL entries are shown is depending on the amount of already existing votes (if any, excluding yours) to get them mapped ASAP</li>
            <li>Likewise the MU suggestions for those AL entries are also ordered by the amount of existing votes first (if any) and the underlying search engine's confidence second</li>
            <li>Years for older manga are often different between AL and MU, sometimes MU has the year of a re-release or due to the MU entry including multiple works</li>
            <li>There may be a difference between chapter and volume counts between AL and MU</li>
            <li>If the covers match, the chances are very likely it's the right thing</li>
            <li>In some cases MU uses a different name for the same author. When in doubt, check the author on AL for alternative pen names</li>
            <li>MU often only has One Shots as part of a compilation</li>
            <li>An exact native title match doesn't guarantee it's the same thing. In some cases where there are multiple manga with the same title MU puts the author name behind the title in parentheses</li>
            <li>Sometimes the titles of works featured in a MU compilation are located in the description instead of the "Alternative titles" section</li>
            <li>Sometimes MU only has the Manga adaption of a Light Novel while AL has both the LN and the manga adaption. Please take extra care comparing the formats and avoid linking the AL LN to the MU manga.</li>
          </ul>
        </div>
      </div>
    </div>`

  private readonly revokeConfirmationModal = `
    <div class="modal" id="revoke-confirmation-modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content" style="width: 50em;">
          <a href="#" class="close" role="button" aria-label="Close">
            <span aria-hidden="true">×</span>
          </a>
          <h5 class="modal-title">Revoke confirmation</h5>
          <p>
            Do you really want to revoke your vote?<br>
            The entry will return back to the pool of personally unvoted for AL entries.
          </p>
          <div class="text-right">
            <a href="#" class="btn btn-danger" role="button" id="revoke-confirmation">Confirm</a>
          </div>
        </div>
      </div>
    </div>`

  private readonly cardTemplate = `
    <div class="card p-0 d-flex">
      <img loading="lazy" class="img-fluid rounded-top align-self-top">
      <div class="content media-info" style="flex-grow:1;">
        <div class="d-flex justify-content-between">
          <h2 class="content-title"></h2>
          <div class="actions text-right">
            <button class="btn"></button>
            <br><span class="ranking-score"></span>
            <br><span class="voters"></span>
          </div>
        </div>
        <span class="other-titles"></span>
        <div class="d-flex justify-content-between">
          <div>
            <span class="type"></span><br>
            <span class="status"></span><br>
            <span class="release"></span>
          </div>
          <div>
            <span class="author"></span>
          </div>
        </div>
        <details class="collapse-panel">
          <summary class="collapse-header">Description</summary>
          <div class="collapse-content description"></div>
        </details>
      </div>
    </div>`

  private readonly mapperHeader = `
    <div id="mapper-header">
      <div class="d-block d-sm-flex justify-content-around">
        <div>Total manga: <span id="total_manga">?</span></div>
        <div>Total unmapped manga: <span id="total_unmapped">?</span></div>
        <div>Total mapped manga: <span id="total_mapped">?</span></div>
        <div>Total personally unvoted manga: <span id="total_unvoted">?</span></div>
        <div>Total personally unvoted for current filters: <span id="total_unvoted_filtered">?</span></div>
      </div>
      <div class="d-flex">
        <div class="d-none d-xl-block w-xl-half">
          <div class="d-flex" style="justify-content: center;line-height: 2.5rem;">
            <strong>AniList entry</strong>
          </div>
        </div>
        <div class="w-full w-xl-half">
          <div class="d-flex" style="justify-content: center;gap: 1rem;">
            <button id="multi-mode" class="btn" title="Only use this if you are 100% certain that an AL entry is referring to multiple MangaUpdates entries as it's rather rare">Map to multiple entries</button>
            <button id="multi-submit" class="btn btn-primary d-none">Submit</button>
            <a href="#mapping-info-modal" class="btn btn-action"><i class="fa fa-circle-question"></i></a>
            <input id="manual-input" class="form-control" placeholder="MangaUpdates URL" title="If the right entry isn't listed but you know that it exists on MU you can enter the URL to the entry here and load the information to map this manga">
            <button id="manual-submit" class="btn btn-primary" disabled="disabled">Load</button>
          </div>
        </div>
      </div>
    </div>`

  private readonly notLoggedInContent = `
    <h4>What does this tool do?</h4>
    <p>If you used the BetterList tool to browse manga you may have noticed the experimental "Publisher", "Publication" and "Only fully scanlated" filters.
    These filters are based on MangaUpdates data which in turn requires AniList and MangaUpdates entries to be "mapped" to each other.
    The AniTools backend already has mappings for a large portion of AL manga from other data sources like Animeshon and MangaDex but the rest will require extra work.
    Due to many factors however this process can't be done in a fully automated manner and thus i've written a Mapping tool that can be used by volunteers to help getting all the currently unmapped AL manga associated with MangaUpdates entries.
    To prevent the vote-based system from abuse it requires an AL login. <br>
    To log in, open the settings and click the "Login using AL" button.
    `

  private readonly sectionDropdown = `
    <select id="mapper-section" class="form-control">
      <option value="mapping">Mapping</option>
      <option value="my-votes">My votes</option>
    </select>
    `
  private curSection: string

  private readonly multiCheckbox = `<input type="checkbox" class="multi-check d-none" />`
  private mediaContainer: HTMLDivElement
  private readonly japaneseRegex = /(?![\uff5e])[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/
  private readonly chineseRegex = /\p{Script=Han}/u
  private readonly koreanRegex = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g

  private curStaffRegex: RegExp[]
  private curVolumesRegex: RegExp | null
  private curFormatRegex: RegExp | null
  private curYearRegex: RegExp
  private curAlNativeTitleRegex: RegExp | null
  private curAlRomajiTitleRegex: RegExp

  private cardTemplateElement: HTMLTemplateElement
  private loader: HTMLDivElement
  private abortController: AbortController | undefined

  private table: Api<HTMLTableElement> | undefined
  // Contains the ID of the vote where the "Revoke" button has been clicked on
  private selectedVoteId: string | null = null

  constructor(aniTools: AniTools, filters: Filters) {
    this.AniTools = aniTools
    this.Filters = filters
    this.cardTemplateElement = document.createElement('template')
    this.cardTemplateElement.innerHTML = this.cardTemplate
    this.loader = document.createElement('div')
    this.loader.classList.add('loader')
  }

  public readonly load = (): void => {
    // Hide the real media type select and replace it with a hidden input to force it to Manga until the day where
    // we may need to map anime to another platform
    this.mediaTypeSelect.value = 'MANGA'
    this.mediaTypeSelect.classList.add('d-none')

    if (!this.AniTools.isLoggedIn()) {
      document.querySelector('#page-content')!.innerHTML = this.notLoggedInContent
      return
    }

    document.querySelector('#tool-dropdown')?.insertAdjacentHTML('afterend', this.sectionDropdown)
    this.curSection = 'mapping'
    document.querySelector('#mapper-section')?.addEventListener('change', this.sectionChangeHandler)

    this.loadMapper()
    console.log('Module Mapper loaded.')
  }

  public readonly unload = (): void => {
    this.unloadCurSection()
    document.querySelector('#page-content')!.innerHTML = ''
    document.querySelector('#mapper-section')?.remove()
    this.Filters.removeFilters()

    this.mediaTypeSelect.classList.remove('d-none')
    console.log('Module Mapper unloaded.')
  }

  private readonly sectionChangeHandler = (ev: Event): void => {
    this.unloadCurSection()

    this.curSection = ev.target.value
    switch (this.curSection) {
      case 'mapping':
        this.loadMapper()
        break;
      case 'my-votes':
        this.loadVotes()
        break;
    }
  }

  private readonly unloadCurSection = (): void => {
    switch (this.curSection) {
      case 'mapping':
        document.querySelector('#mapping-info-modal')?.remove()
        this.mediaContainer.remove()
        document.querySelector('#mapper-header')?.remove()

        // Column filters
        this.Filters.removeEventListener('filter-changed', this.filterChangeHandler)
        break;
      case 'my-votes':
        if (this.table !== undefined) {
          this.table.destroy()
          this.table = undefined
        }
        document.querySelector('#my-votes')!.remove()
        document.querySelector('#revoke-confirmation-modal')?.remove()
        break;
    }
  }

  private readonly loadMapper = async (): Promise<void> => {
    this.mediaContainer = document.createElement('div')
    this.mediaContainer.classList.add('mapper-content')
    document.querySelector('#page-content')!.insertAdjacentHTML('beforeend', this.mapperHeader)
    document.querySelector('#page-content')!.insertAdjacentElement('beforeend', this.mediaContainer)
    document.querySelector('body')!.insertAdjacentHTML('beforeend', this.infoModal)
    document.querySelector('#multi-mode')!.addEventListener('click', this.multiModeHandler)
    document.querySelector('#multi-submit')!.addEventListener('click', this.multiSubmitHandler)
    document.querySelector('#manual-submit')!.addEventListener('click', this.manualInputHandler)

    await this.Filters.updateFilters('MAPPER')

    // Column filters
    this.Filters.addEventListener('filter-changed', this.filterChangeHandler)

    this.getSuggestion()
  }

  private readonly loadVotes = async (): Promise<void> => {
    // Create <table>
    const t: HTMLTableElement = document.createElement('table')
    t.id = 'my-votes'
    t.classList.add('table-inner-bordered', 'table-striped')
    t.style.width = '100%'
    document.querySelector('#page-content')!.insertAdjacentElement('beforeend', t)
    document.querySelector('body')!.insertAdjacentHTML('beforeend', this.revokeConfirmationModal)
    document.querySelector('#revoke-confirmation')?.addEventListener('click', this.revokeVote)

    await this.updateTable()
  }

  // Function that updates or creates the DataTables instance
  private readonly updateTable = async (): Promise<void> => {
    if (this.table !== undefined) {
      this.table.ajax.reload()
      return
    }

    const options = {
      serverSide: true,
      ajax: async (data, callback, settings) => {
        this.abortController && this.abortController.abort()
        this.abortController = new AbortController()
        let response: Response | null = null
        try {
          response = await this.AniTools.fetch('/mapper/getUserVotes', {
            method: 'POST',
            body: JSON.stringify(data),
            signal: this.abortController.signal
          })
        } catch (error) {
          callback({
            data: [],
            recordsTotal: 0,
            recordsFiltered: 0
          })
          return
        }

        const json = await response?.json()
        callback(json)
      },
      processing: true,
      paging: true,
      pageLength: 100,
      pagingType: 'simple_numbers',
      fixedHeader: true,
      autoWidth: true,
      info: true,
      dom: "<'row'i<'#stats'>>" +
        '<tr>' +
        "<'row'lp>",
      initComplete: function () {
        document.querySelector('.dt-length')?.classList.add('form-inline')
        document.querySelector('.dt-length .dt-input')?.classList.add('form-control')
      },
      columns: [
        {
          name: 'title',
          title: 'AniList Title',
          data: 'title_romaji',
          className: 'media-col',
          render: (data: string, _type, row: Media) => {
            const coverData = row.cover_image ? '<img loading="lazy" src="' + row.cover_image + '">' : ''
            return '<a target="_blank" href="https://anilist.co/manga/' + row.id.toString() + '">' + coverData + data + '</a>'
          }
        },
        {
          name: 'voted_entries',
          title: 'Voted MU Titles',
          data: 'voted_entries',
          className: 'media-col',
          render: (data: object[], _type, row: Media) => {
            if (data === null) {
              return null
            }
            let output: string[] = []
            data.forEach((muEntry) => {
              const coverData = muEntry.cover ? '<img loading="lazy" src="' + muEntry.cover + '">' : ''
              output.push('<a target="_blank" href="https://mangaupdates.com/series/' + muEntry.id.toString(36) + '">' + coverData + muEntry.titles[0] + '</a>')
            })

            return output.join('<br>')
          }
        },
        {
          name: 'mapped_entries',
          title: 'Mapped Titles',
          data: 'mapped_entries',
          className: 'media-col',
          render: (data: object[], _type, row: Media) => {
            if (data === null) {
              return null
            }
            let output: string[] = []
            data.forEach((muEntry) => {
              const coverData = muEntry.cover ? '<img loading="lazy" src="' + muEntry.cover + '">' : ''
              output.push('<a target="_blank" href="https://mangaupdates.com/series/' + muEntry.id.toString(36) + '">' + coverData + muEntry.titles[0] + '</a>')
            })

            return output.join('<br>')
          }
        },
        {
          name: 'voted_on',
          title: 'Voted on',
          data: 'voted_on',
        },
        {
          name: 'revoke',
          title: '',
          data: 'mv_id',
          render: (data, _type, row: Media) => {
            if (row.mapped_entries !== null) {
              return null
            }

            return '<a role="button" href="#revoke-confirmation-modal" data-id="' + data + '" class="btn btn-sm revoke-vote">Revoke Vote</button>'
          }
        },
      ],
    }

    this.table = new DataTable('#my-votes', options)

    on('#my-votes', 'click', '.revoke-vote', (ev) => {
      this.selectedVoteId = ev.target.dataset.id
    })
  }

  private debouncer: number
  private readonly filterChangeHandler = (): void => {
    clearTimeout(this.debouncer)
    this.debouncer = setTimeout(() => {
      this.getSuggestion()
    }, 500);
  }

  private readonly manualInputHandler = async (): Promise<void> => {
    const input = document.querySelector('#manual-input')!.value
    let response
    try {
      response = await this.AniTools.fetch('/mapper/getMangaUpdatesInfo', {
        method: 'POST',
        body: JSON.stringify({
          input: input
        })
      })
    } catch (error) {
      return
    }

    const result = await response.json()

    if (Object.hasOwn(result, 'error')) {
      this.AniTools.alert(result.error, 'danger')
      return
    }

    const card = this.getSuggestionCard(result)
    this.mediaContainer.querySelector('.anilist-entry')!.insertAdjacentElement('afterend', card)
    document.querySelector('#manual-input')!.value = ''
  }

  private readonly multiModeHandler = (): void => {
    const multiModeBtn = document.querySelector('#page-content')!.querySelector('#multi-mode')!;
    multiModeBtn.classList.toggle('btn-primary')
    let isActive = multiModeBtn.classList.contains('btn-primary')
    document.querySelector('#page-content')!.querySelector('#multi-submit')!.classList.toggle('d-none', !isActive)
    document.querySelector('#page-content')!.querySelectorAll('.card:not(.anilist-entry) .actions').forEach((div) => {
      div.querySelector('.btn')!.classList.toggle('d-none', isActive)
      div.querySelector('.multi-check')!.classList.toggle('d-none', !isActive)
    });
  }

  private readonly escapeStringForRegEx = (input: string): string => {
    // Escape special characters
    input = input.replaceAll('.', '\\.')
      .replaceAll('?', '\\?')
      .replaceAll('(', '\\(')
      .replaceAll(')', '\\)')
      .replaceAll('|', '\\|')
      .replaceAll('*', '\\*')
      .replaceAll('^', '\\^')
      .replaceAll('[', '\\[')
      .replaceAll(']', '\\]')
      .replaceAll('+', '\\+')
      .replaceAll('/', '\\/')
      .replaceAll('$', '\\$')
      .trim()

    return input
  }

  private readonly getSuggestion = async (): Promise<void> => {
    this.mediaContainer.innerHTML = ''
    this.mediaContainer.insertAdjacentElement('beforeend', this.loader.cloneNode())
    document.querySelector('#manual-submit').disabled = 'disabled'
    
    this.abortController && this.abortController.abort()
    this.abortController = new AbortController()

    let response: Response | null = null
    try {
      response = await this.AniTools.fetch('/mapper/getSuggestion', {
        method: 'POST',
        body: JSON.stringify(this.Filters.getFilterParams()),
        signal: this.abortController.signal
      })
    } catch (error) {
      this.mediaContainer.innerHTML = ''
      return
    }

    const result = await response.json()

    // In case the user switches before the content could be shown
    if (this.mediaContainer === undefined) {
      return
    }

    document.querySelector('#total_manga')!.innerText = result.stats.total_manga
    document.querySelector('#total_unmapped')!.innerText = result.stats.total_unmapped
    document.querySelector('#total_mapped')!.innerText = result.stats.total_mapped
    document.querySelector('#total_unvoted')!.innerText = result.stats.total_unvoted
    document.querySelector('#total_unvoted_filtered')!.innerText = result.stats.total_unvoted_filtered

    const alEntry = result.al_entry;

    if (Object.hasOwn(result, 'error')) {
      this.AniTools.alert(result.error, 'danger')
    }

    this.mediaContainer.innerHTML = ''

    // Assuming that an empty array will be present instead of an object
    if (alEntry.length === 0) {
      return;
    }
    // Change format based on country to align with MangaUpdates
    let format = alEntry.format
    if (format === 'MANGA') {
      if (alEntry.country_of_origin === 'KR') {
        format = 'Manhwa'
      }
      if (alEntry.country_of_origin === 'CN') {
        format = 'Manhua'
      }
    }
    if (format !== null) {
      format = format[0].toUpperCase() + format.substr(1).toLowerCase()
    }

    let w: string
    let status = alEntry.status;
    if (alEntry.episodes !== null) {
      w = alEntry.episodes + ' Chapter' + (alEntry.episodes > 1 ? 's' : '')
      status += ' (' + w + ')'
    }
    this.curVolumesRegex = null
    if (alEntry.volumes !== null) {
      w = alEntry.volumes + ' Volume' + (alEntry.volumes > 1 ? 's' : '')
      this.curVolumesRegex = new RegExp(w, 'i')
      status += ' (' + w + ')'
    }

    // Prepare RegExps for highlighting in the suggestions
    this.curFormatRegex = format ? new RegExp(format) : null
    const startDate = [alEntry.start_date_y, alEntry.start_date_m, alEntry.start_date_d].filter(Boolean).join('-')
    this.curYearRegex = new RegExp(alEntry.start_date_y)
    this.curStaffRegex = []
    let staff: Staff[] = []
    alEntry.authors.forEach((author) => {
      // Remove superfluous spaces, just in case
      author.name_last = author.name_last !== null ? author.name_last.trim() : null
      author.name_first = author.name_first !== null ? author.name_first.trim() : null
      let name = [author.name_last, author.name_first].filter(Boolean).join(' ')
      // The handling of "ō" varies between platforms, higlighting should work with "o" and "ou"
      // AL usually only has "o", but sometimes "ou"
      let regName = this.escapeStringForRegEx(name)
      regName = regName.replaceAll(/uu?/g, 'uu?').replaceAll(/ou?/g, 'ou?')

      this.curStaffRegex.push(new RegExp('(' + regName + ')|(' + regName.split(' ').reverse().join(' ') + ')', 'gi'))

      staff.push({
        id: author.id,
        name: name,
        role: author.role
      })
    });

    let mediacard = this.getCard(
      '<a target="_blank" href="https://anilist.co/manga/' + alEntry.id + '">' + alEntry.title_romaji + '<br>(' + result.al_entry.title_native + ')</a>',
      [],
      result.al_entry.cover_image,
      format,
      status,
      startDate,
      staff,
      result.al_entry.description,
      null,
      result.not_found_votes
    )
    mediacard.classList.add('anilist-entry')
    const btn: HTMLButtonElement = mediacard.querySelector('.btn')!
    btn.innerText = 'None found'
    btn?.addEventListener('click', this.markNoneFound);

    this.curAlNativeTitleRegex = null
    let title = alEntry.title_native
    if (title !== null) {
      title = this.escapeStringForRegEx(title)
      // Native titles may contain fullwidth versions of punctuation marks
      this.optionalCharacterMapping.forEach((mapping) => {
        // Check for both the normal and the full-width version
        let matched: Array<string> = []
        mapping.forEach((char) => {
          if (title.indexOf(char) > 0) {
            matched.push(char)
          }
        })

        matched.forEach((char) => {
          title = title.replaceAll(char, '(' + mapping.join('|') + ')?')
        });
      })
      this.requiredCharacterMapping.forEach((mapping) => {
        // Check for both the normal and the full-width version
        const checkA = title.indexOf(mapping[0]) > 0
        const checkB = title.indexOf(mapping[1]) > 0

        if (checkA) {
          title = title.replaceAll(mapping[0], '(' + mapping[0] + '|' + mapping[1] + ')')
        }
        if (checkB) {
          title = title.replaceAll(mapping[1], '(' + mapping[0] + '|' + mapping[1] + ')')
        }
      })
      this.curAlNativeTitleRegex = new RegExp(title, 'gi')
    }
    this.curAlRomajiTitleRegex = new RegExp(alEntry.title_romaji, 'gi')
    this.mediaContainer.insertAdjacentElement('afterbegin', mediacard)
    this.mediaContainer.dataset.id = alEntry.id
    result.suggestions.forEach(suggestion => {
      let card = this.getSuggestionCard(suggestion)
      this.mediaContainer.insertAdjacentElement('beforeend', card)
    });

    document.querySelector('#manual-submit')?.removeAttribute('disabled')
  }

  private readonly getSuggestionCard = (suggestion: MapperSuggestion) => {
    let staff: Staff[] = []
    suggestion.authors.forEach((author) => {
      // If the last name is all uppercase, make it normal
      let exp = author.name.split(' ')
      if (exp.length > 1 && exp[0].split('').filter(a => a === a.toLowerCase()).length === 0) {
        author.name = exp[0][0] + exp[0].substring(1).toLowerCase() + ' ' + exp[1]
      }
      staff.push({
        id: author.author_id,
        name: author.name,
        role: author.type,
      });
    });
    let title: string = suggestion.titles.shift()!
    let nativeRegex: RegExp = this.japaneseRegex
    switch (suggestion.type) {
      case 'Manhwa':
        nativeRegex = this.koreanRegex
        break;
      case 'Manhua':
        nativeRegex = this.chineseRegex
        break;
    }
    let nativeTitle: string = suggestion.titles.filter(t => {
      return t.match(nativeRegex) !== null
    }).shift();
    delete suggestion.titles[nativeTitle]
    let card = this.getCard(
      '<a target="_blank" href="https://mangaupdates.com/series/' + suggestion.id.toString(36) + '">' + title + '<br>(' + nativeTitle + ')</a>',
      suggestion.titles,
      suggestion.cover,
      suggestion.type,
      suggestion.original_status,
      suggestion.year,
      staff,
      suggestion.description,
      suggestion.score,
      suggestion.voters
    )
    card.querySelector('.actions')!.insertAdjacentHTML('beforeend', this.multiCheckbox)
    let checkbox: HTMLInputElement = card.querySelector('.actions .multi-check')!
    checkbox.dataset.id = suggestion.id.toString()

    const marker = '<mark class="highlight">$&</mark>';
    const mediaInfo = card.querySelector('.media-info')!
    if (this.curAlNativeTitleRegex !== null) {
      mediaInfo.querySelector('.content-title a')!.innerHTML = mediaInfo.querySelector('.content-title a')!.innerHTML.replaceAll(this.curAlNativeTitleRegex, marker)
      mediaInfo.querySelector('.other-titles')!.innerHTML = mediaInfo.querySelector('.other-titles')!.innerHTML.replaceAll(this.curAlNativeTitleRegex, marker)
    }
    mediaInfo.querySelector('.other-titles')!.innerHTML = mediaInfo.querySelector('.other-titles')!.innerHTML.replaceAll(this.curAlRomajiTitleRegex, marker)
    if (mediaInfo.querySelector('.description')) {
      let before = mediaInfo.querySelector('.description')!.innerHTML
      if (this.curAlNativeTitleRegex !== null) {
        mediaInfo.querySelector('.description')!.innerHTML = before.replaceAll(this.curAlNativeTitleRegex, marker)
      }
      mediaInfo.querySelector('.description')!.innerHTML = before.replaceAll(this.curAlRomajiTitleRegex, marker)
      if (before !== mediaInfo.querySelector('.description')!.innerHTML) {
        mediaInfo.querySelector('.collapse-header')!.innerHTML = 'Description (has match)'
      }
    }
    mediaInfo.querySelector('.release')!.innerHTML = mediaInfo.querySelector('.release')!.innerHTML.replace(this.curYearRegex, marker)
    if (this.curFormatRegex !== null) {
      mediaInfo.querySelector('.type')!.innerHTML = mediaInfo.querySelector('.type')!.innerHTML.replace(this.curFormatRegex, marker)
    }
    if (this.curVolumesRegex !== null) {
      mediaInfo.querySelector('.status')!.innerHTML = mediaInfo.querySelector('.status')!.innerHTML.replace(this.curVolumesRegex, marker)
    }
    this.curStaffRegex.forEach((r) => {
      mediaInfo.querySelector('.author')!.innerHTML = mediaInfo.querySelector('.author')!.innerHTML.replace(r, marker)
    })
    let btn: HTMLAnchorElement = card.querySelector('.btn')!
    btn.innerText = 'This one'
    btn.dataset.id = suggestion.id.toString()
    btn?.addEventListener('click', this.singleSubmitHandler)

    const isActive = document.querySelector('#multi-mode')!.classList.contains('btn-primary')
    btn.classList.toggle('d-none', isActive)
    checkbox.classList.toggle('d-none', !isActive)

    return card
  }

  private readonly getCard = (
    title: string,
    otherTitles: string[],
    image: string,
    type: string,
    status: string,
    release: string,
    authors: Staff[] = [],
    description: string | null = null,
    score: number | null = null,
    voters: string[] | null = null
  ): HTMLElement => {
    let mediacard: HTMLDivElement = this.cardTemplateElement.content.cloneNode(true) as HTMLDivElement
    mediacard.querySelector('img')!.src = image
    mediacard.querySelector('h2')!.innerHTML = title
    mediacard.querySelector('.type')!.innerText = type
    mediacard.querySelector('.status')!.innerHTML = status
    mediacard.querySelector('.release')!.innerText = release
    let authorList: string[] = [];
    authors.forEach((author) => {
      // TODO: Maybe finde a better way to differentiate between AL and MU staff
      let link = ''
      if (score === null) {
        link = 'https://anilist.co/staff/' + author.id
      } else {
        link = 'https://www.mangaupdates.com/author/' + author.id.toString(36)
      }

      let label = author.name
      if (author.role !== null) {
        label += ' (' + author.role + ')'
      }

      authorList.push('<a href="' + link + '">' + label + '</a>')
    });
    mediacard.querySelector('.author')!.innerHTML = authorList.join('<br>\n')
    mediacard.querySelector('.other-titles')!.innerHTML = '<span>' + otherTitles.join('</span><span>') + '</span>'
    if (description !== "" && description !== null) {
      mediacard.querySelector('.description')!.innerHTML = description
    } else {
      mediacard.querySelector('.description')!.closest('details')!.remove()
    }
    if (score !== null) {
      mediacard.querySelector('.ranking-score')!.innerHTML = 'Confidence Score: ' + score.toFixed(2)
    }
    if (voters !== null && voters.length > 0) {
      mediacard.querySelector('.voters')!.innerHTML = 'Voted by: <br>' + voters.join(', ')
    }

    return mediacard.querySelector('.card')!
  }

  private readonly markNoneFound: EventListener = async () => {
    let alId = this.mediaContainer.dataset.id;
    await this.AniTools.fetch('/mapper/noneFound', {
      method: 'POST',
      body: JSON.stringify({
        al_id: alId
      })
    })
    this.getSuggestion()
  }

  private readonly singleSubmitHandler: EventListener = (ev) => {
    let alId = parseInt(this.mediaContainer.dataset.id!)
    let muId = ev.target!.dataset.id!

    this.createMapping(alId, [muId])
  }

  private readonly multiSubmitHandler: EventListener = () => {
    let alId = parseInt(this.mediaContainer.dataset.id!)

    let muIds: number[] = [];
    document.querySelector('#page-content')!.querySelectorAll('.actions [type="checkbox"]:checked').forEach(
      (checkbox: HTMLInputElement) => {
        muIds.push(parseInt(checkbox.dataset.id!))
      }
    )

    this.createMapping(alId, muIds)

    this.multiModeHandler()
  }

  private readonly createMapping = async (alId: number, muIds: Array<number>) => {
    await this.AniTools.fetch('/mapper/createMapping', {
      method: 'POST',
      body: JSON.stringify({
        al_id: alId,
        mu_id: muIds,
      })
    })
    this.getSuggestion()
  }

  private readonly revokeVote: EventListener = async (ev) => {
    await this.AniTools.fetch('/mapper/revokeVote', {
      method: 'POST',
      body: JSON.stringify({
        vote: this.selectedVoteId
      })
    })

    this.selectedVoteId = null

    this.updateTable()
  }
}

export default Mapper