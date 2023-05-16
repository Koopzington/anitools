import $ from 'jquery'
import { Api } from "datatables.net";

class ActivityLister {
  private url = 'https://graphql.anilist.co';
  private activityQuery = `
    query ($page: Int $userId: Int $mediaId: Int) {
      Page (page: $page) {
        pageInfo {
          hasNextPage
        }
        activities (userId: $userId mediaId: $mediaId) {
          ... on ListActivity {
            id
            status
            progress
            createdAt
            media {
              title {
                romaji
              }
            }
          }
        }
      }
    }`;

  private options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  private activityTable: Api<any>
  private activityData = []

  private updateActivityTable = (id: number) => {
    if (this.activityTable) {
      this.activityTable.destroy()
      this.activityTable = undefined
    }
    if (!this.activityData[0]) {
      document.querySelector('#activity-media-title').innerHTML = "No data!";
      return false
    }
    document.querySelector('#activity-media-title').innerHTML = this.activityData[0].title;
    document.querySelector('#activity-media-title').href = 'https://anilist.co/anime/' + id;
    this.activityTable = $('#activities').DataTable({
      data: this.activityData,
      dom: "<tr>",
      paging: false,
      searching: false,
      info: false,
      fixedHeader: true,
      columns: [
        {
          title: 'Progress',
          data: 'progress',
        },
        {
          title: 'Date',
          data: 'created',
          render: {
            _: (data, type, row) => '<a href="https://anilist.co/activity/' + row.id + '">' + data + '</a>',
            sort: data => data,
          }
        },
      ],
      order: [
        [1, 'desc'],
      ],
    });
  };

  private getDateString = (utcTimestamp: number) => {
    const d = new Date(utcTimestamp * 1000)

    return d.getFullYear() + '-'
      + (d.getMonth() + 1).toString().padStart(2,'0') + '-'
      + d.getDate().toString().padStart(2,'0') + ' '
      + d.getHours().toString().padStart(2, '0') + ':'
      + d.getMinutes().toString().padStart(2, '0') + ':'
      + d.getSeconds().toString().padStart(2, '0')
  }

  private handleActivity = (data: Array<ALActivity>) => {
    data.forEach((a) => {
      if (a.progress !== null) {
        this.activityData.push({
          id: a.id,
          progress: a.progress,
          title: a.media.title.romaji,
          created: this.getDateString(a.createdAt),
        });
      } else {
        this.activityData.push({
          id: a.id,
          progress: a.status.toUpperCase(),
          title: a.media.title.romaji,
          created: this.getDateString(a.createdAt),
        })
      }
    });
  };

  public getActivities = async (user: string, anime: number) => {
    let variables = {
      page: 1,
      userId: user,
      mediaId: anime,
    }

    this.activityData = [];

    // Make the HTTP Api request
    let options = JSON.parse(JSON.stringify(this.options));
    let hasNextPage = true;

    while (hasNextPage === true) {
      options.body = JSON.stringify({
        query: this.activityQuery,
        variables: variables,
      });
      const result = await fetch(this.url, options)
      const data = await result.json()
      this.handleActivity(data.data.Page.activities)
      hasNextPage = data.data.Page.pageInfo.hasNextPage
      variables.page++
    }

    this.updateActivityTable(anime);
  };
}

export default ActivityLister