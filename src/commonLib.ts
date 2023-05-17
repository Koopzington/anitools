import $ from 'jquery'

const handleResponse = async (response: Response): Promise<any> => {
  const json = await response.json()

  return response.ok ? json : await Promise.reject(json)
}

const handleError = (error: Error): void => {
  if (error.name !== 'AbortError') {
    console.error(error)
  }
}

// Function for eventlistener delegation. For cases where you want to listen to an event on elemens that might not exist yet
const on = function (wrapperSelector: string, eventName: string, targetSelector: string, fn: Function): EventListener {
  const element = document.querySelector(wrapperSelector)

  const handler: EventListener = function (event: Event) {
    const possibleTargets = element.querySelectorAll(targetSelector)
    const target = event.target
    let el: EventTarget | null
    let p: Element

    for (let i = 0, l = possibleTargets.length; i < l; i++) {
      el = target
      p = possibleTargets[i]

      while (el !== null && el !== element) {
        if (el === p) {
          return fn.call(p, event)
        }

        el = el.parentNode
      }
    }
  }

  element.addEventListener(eventName, handler)

  return handler
}

// Custom Halfmoon styled pagination for DataTables
$.fn.dataTableExt.oPagination.halfmoon = {
  fnClickHandler: function (e) {
    const fnCallbackDraw = e.data.fnCallbackDraw
    const oSettings = e.data.oSettings
    const sPage = e.data.sPage

    if ($(this).is('[disabled]') === true) {
      return false
    }

    oSettings.oApi._fnPageChange(oSettings, sPage)
    fnCallbackDraw(oSettings)

    return true
  },
  // fnInit is called once for each instance of pager
  fnInit: function (oSettings, nPager, fnCallbackDraw) {
    const iShowPages: number = oSettings.oInit.iShowPages ?? 5
    const iShowPagesHalf = Math.floor(iShowPages / 2)

    $.extend(oSettings, {
      _iShowPages: iShowPages,
      _iShowPagesHalf: iShowPagesHalf
    })

    const oPrevious = $('<li class="page-item page-previous"><a class="page-link" href="#"><i class="fa fa-angle-left" aria-hidden="true"></i></a></li>')
    const oNumbers = $('<span class="page-numbers"></span>')
    const oNext = $('<li class="page-item page-next"><a class="page-link" href="#"><i class="fa fa-angle-right" aria-hidden="true"></i></a></li>')

    oPrevious.click({ fnCallbackDraw, oSettings, sPage: 'previous' }, this.fnClickHandler)
    oNext.click({ fnCallbackDraw, oSettings, sPage: 'next' }, this.fnClickHandler)

    // Draw
    nPager.insertAdjacentElement('beforeEnd', oPrevious[0])
    nPager.insertAdjacentElement('beforeEnd', oNumbers[0])
    nPager.insertAdjacentElement('beforeEnd', oNext[0])
  },
  // fnUpdate is only called once while table is rendered
  fnUpdate: function (oSettings, fnCallbackDraw) {
    const tableWrapper = oSettings.nTableWrapper

    // Update stateful properties
    this.fnUpdateState(oSettings)
    if (oSettings._iCurrentPage === 1) {
      tableWrapper.querySelector('.page-previous').classList.add('disabled')
    } else {
      tableWrapper.querySelector('.page-previous').classList.remove('disabled')
    }

    if (oSettings._iTotalPages === 0 || oSettings._iCurrentPage === oSettings._iTotalPages) {
      tableWrapper.querySelector('.page-next').classList.add('disabled')
    } else {
      tableWrapper.querySelector('.page-next').classList.remove('disabled')
    }

    let i; let oNumber; const oNumbers = $('.page-numbers')

    // Erase
    oNumbers.html('')

    // First page if not rendered by loop
    // if (oSettings._iFirstPage > 1) {}

    for (i = oSettings._iFirstPage; i <= oSettings._iLastPage; i++) {
      oNumber = $('<li class="page-item"><a class="page-link" href="#">' + oSettings.fnFormatNumber(i) + '</a>')

      if (oSettings._iCurrentPage === i) {
        oNumber[0].classList.add('active')
      } else {
        oNumber.click({ fnCallbackDraw, oSettings, sPage: i - 1 }, this.fnClickHandler)
      }

      // Draw
      oNumbers.append(oNumber)
    }

    // Add ellipses
    if (oSettings._iFirstPage > 1) {
      oNumber = $('<li class="page-item" data-page="1"><a class="page-link" href="#">' + oSettings.fnFormatNumber(1) + '</a>')
      oNumber.click({ fnCallbackDraw, oSettings, sPage: 'first' }, this.fnClickHandler)
      oNumbers.prepend(oNumber)
      if (oSettings._iFirstPage > 2) {
        oNumber[0].insertAdjacentHTML('afterEnd', '<li class="page-item ellipsis"></li>')
      }
    }

    if (oSettings._iLastPage < oSettings._iTotalPages) {
      if (oSettings._iLastPage + 1 < oSettings._iTotalPages) {
        oNumbers.append('<li class="page-item ellipsis"></li>')
      }
      oNumber = $('<li class="page-item" data-page="' + oSettings._iTotalPages + '"><a class="page-link" href="#">' + oSettings.fnFormatNumber(oSettings._iTotalPages) + '</a>')
      oNumber.click({ fnCallbackDraw, oSettings, sPage: 'last' }, this.fnClickHandler)
      oNumbers.append(oNumber)
    }
  },
  // fnUpdateState used to be part of fnUpdate
  // The reason for moving is so we can access current state info before fnUpdate is called
  fnUpdateState: function (oSettings) {
    const iCurrentPage: number = Math.ceil((oSettings._iDisplayStart + 1) / oSettings._iDisplayLength)
    const iTotalPages: number = Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
    let iFirstPage = iCurrentPage - oSettings._iShowPagesHalf
    let iLastPage = iCurrentPage + oSettings._iShowPagesHalf

    if (iTotalPages < oSettings._iShowPages) {
      iFirstPage = 1
      iLastPage = iTotalPages
    } else if (iFirstPage < 1) {
      iFirstPage = 1
      iLastPage = oSettings._iShowPages
    } else if (iLastPage > iTotalPages) {
      iFirstPage = (iTotalPages - oSettings._iShowPages) + 1
      iLastPage = iTotalPages
    }

    $.extend(oSettings, {
      _iCurrentPage: iCurrentPage,
      _iTotalPages: iTotalPages,
      _iFirstPage: iFirstPage,
      _iLastPage: iLastPage
    })
  }
}

export {
  on,
  handleResponse,
  handleError
}
