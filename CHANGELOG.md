# Changelog

## 2025-06-04
- Filter values are now stored and reused between sessions

## 2025-06-03
- Added new Synonyms column
- Cut off notes and display them fully in tooltips while hovering over them

## 2025-05-21
- Added support for regex on the notes filter

## 2025-05-12
- Added support for media marked as private as well as a column for that info

## 2025-04-08
- Added new Genre and Tag Count columns

## 2025-03-17
- Fixed range sliders incorrectly resetting to max values of 9999 [#212](https://github.com/Koopzington/anitools/issues/212)

## 2025-03-06
- Splitted search for studio/producer filter

## 2025-02-25
- Added new Description filter for anime, manga, characters and staff
- Added new Age (character) and Primary Occupation (staff) columns
- Added new Primary Occupation filter for staff

## 2025-02-12
- Added new "Relation to an anime on an AWC Community List" filter for manga
- Added new Popularity filter

## 2025-01-09
- Added new ID filter

## 2025-01-04
- Added more tooltips for date filters to inform about the possibility to use "*" as wildcards
- Fixed a CSS issue where tooltips weren't shown on top of other content
- Moved the feedback button from the Settings to the header/sidebar
- Fixed an issue where the Tool and Media type dropdown, Username field and (Re)Load button would vanish during window resizing

## 2025-01-03
- Add "Remove all values" buttons on Tagify instances
- Add a tooltip next to the tag filter to inform about the category grouping setting

## 2025-01-02
- Add a tooltip next to the year filter to inform about the hidden range selection

## 2024-12-09
- Updated dependencies
  - vite from 6.0.2 to 6.0.3
  - @yaireo/tagify from 4.32.1 to 4.32.2 (Dropdowns no longer stay open)

## 2024-12-04
- New columns for alternative names of characters and staff as well as spoiler names for characters have been added
- Updated dependencies
  - vite from 5.4.10 to 6.0.2
  - marked from 14.1.3 to 15.0.3
  - @vitejs/plugin-basic-ssl from 1.1.0 to 1.2.0
  - @fortawesome/fontawesome-free from 6.6.0 to 6.7.1
  - @yaireo/tagify from 4.31.6 to 4.32.1

## 2024-12-03
- The values for the filters Format, Source, Country, Airing Status, Season and Season Year now support exclusion mode

## 2024-11-18
- Implemented the possibility to work with the last fetched lists of a user if they don't want to wait for AL's API to become more stable

## 2024-11-04
- Added new column showing the remaining episodes/chapters (so the opposite of Progress)
- Updated dependencies
  - vite from 5.4.7 to 5.4.10
  - stylelint from 16.9.0 to 16.10.0
  - datatables.net from 2.1.7 to 2.1.8
  - datatables.net-dt from 2.1.7 to 2.1.8
  - @yaireo/tagify from 4.27.0 to 4.31.6
  - marked from 14.1.2 to 14.1.3

## 2024-10-20
- Updated URL format for MangaUpdates links on the Mapper

## 2024-10-01
- Add support for ranges in the year filter

## 2024-09-27
- Use selfsigned SSL certs for development environments
- Updated dependencies
  - vite from 5.4.4 to 5.4.7
  - datatables.net from 2.1.6 to 2.1.7
  - datatables.net-dt from 2.1.6 to 2.1.7
  - @fontsource-variable/inter from 5.0.21 to 5.1.0
  - standard from 17.1.0 to 17.1.2

## 2024-09-12
- Staff in the Mapper is now directly linked for more convenience

## 2024-09-11
- Added a RegEx switch for the title and name filters
- Updated dependencies
  - vite from 5.3.3 to 5.4.4

## 2024-09-10
- Debounce inputs for sliders to improve user experience while entering numbers
- Updated dependencies
  - stylelint from 16.8.2 to 16.9.0
  - datatables.net-dt from 2.1.4 to 2.1.6
  - datatables.net from 2.1.4 to 2.1.6
  - marked from 14.1.0 to 14.1.2
  - @fontsource-variable/inter from 5.0.20 to 5.0.21

## 2024-08-27
- Fixed a bug where sliders would pass decimal numbers to the API (e.g. UI shows 6 main characters but sends 5.6785)
- Updated dependencies
  - @fontsource-variable/inter from 5.0.19 to 5.0.20
  - datatables.net from 2.0.8 to 2.1.4
  - stylelint from 16.6.1 to 16.8.2
  - vite from 5.3.3 to 5.4.2
  - marked from 13.0.1 to 14.1.0

## 2024-08-10
- Added a new column showing how many days were spent on the completion of a medium (by subtracting the completion and start date)

## 2024-07-09
- Updated dependencies
  - @fontsource-variable/inter from 5.0.18 to 5.0.19
  - marked from 13.0.1 to 13.0.1
  - vite from 5.3.1 to 5.3.3

## 2024-06-25
- Updated dependencies
  - vite from 5.2.13 to 5.3.1
  - @yaireo/tagify from 4.26.5 to 4.27.0
  - stylelint-config-standard from 36.0.0 to 36.0.1
  - nouislider from 15.8.0 to 15.8.1
  - marked from 12.0.2 to 13.0.1

## 2024-06-14
- New Mean Score and Average Score filters were added [#149](https://github.com/Koopzington/anitools/issues/149)

## 2024-06-06
- Improved handling of errors and abortion of running requests caused by user interactions
- Mapper: Users can now get a list of past votes and are able to revoke them if they want to
- Mapper: Load button for manual loading of MU entries is now disabled while loading suggestions

## 2024-06-04
- Updated dependencies
  - vite from 5.2.11 to 5.2.12
  - inputmask from 5.0.8 to 5.0.9
  - datatables.net from 2.0.7 to 2.0.8
  - datatables.net-dt from 2.0.7 to 2.0.8
  - datatables.net-colreorder from 2.0.2 to 2.0.3

## 2024-05-29
- Show "None found" votes on the Mapper
- Lazy loading for images in the Mapper and covers in BetterList
- Updated dependencies
  - stylelint from 16.5.0 to 16.6.0 [#141](https://github.com/Koopzington/anitools/pull/141)

## 2024-05-27
- Added a proper description for the Mapper module when people aren't logged in

## 2024-05-23
- We now store the last used tool between sessions
- Improved highlighting in Mapper for staff names

## 2024-05-19
- BetterList now saves the last selected value from the data type dropdown
- CSS improvements to the Mapper for use on phones

## 2024-05-14
- Added new Mapper module for mapping AL manga to MangaUpdates manga
- Updated dependencies
  - datatables.net-colreorder from 2.0.1 to 2.0.2
  - @yaireo/tagify from 4.26.2 to 4.26.5

## 2024-05-08
- Added a slider for Min/Max Tag Percentage
- Added logic switch to User list filter

## 2024-05-07
- Updated dependencies
  - @yaireo/tagify from 4.26.0 to 4.26.2 [#132](https://github.com/Koopzington/anitools/pull/132)
  - vite from 5.2.10 to 5.2.11 [#134](https://github.com/Koopzington/anitools/pull/134)
  - stylelint from 16.4.0 to 16.5.0 [#135](https://github.com/Koopzington/anitools/pull/135)
  - datatables.net from 2.0.5 to 2.0.6 [#136](https://github.com/Koopzington/anitools/pull/136)
  - datatables.net-dt from 2.0.5 to 2.0.7 [#137](https://github.com/Koopzington/anitools/pull/137)

## 2024-04-30
- Updated dependencies
  - @yaireo/tagify from 4.24.0 to 4.26.0 [#130](https://github.com/Koopzington/anitools/pull/130)
  - stylelint from 16.3.1 to 16.4.0 [#131](https://github.com/Koopzington/anitools/pull/131)

## 2024-04-23
- Added row number column
- Added filters for user start and finish dates
- Updated dependencies
  - datatables.net and datatables.net-dt from 2.0.3 to 2.0.5 [#125](https://github.com/Koopzington/anitools/pull/125)
  - @fontsource-variable/inter from 5.0.17 to 5.0.18 [#126](https://github.com/Koopzington/anitools/pull/126)
  - vite from 5.2.8 to 5.2.10 [#128](https://github.com/Koopzington/anitools/pull/128)
  - marked from 12.0.1 to 12.0.2 [#129](https://github.com/Koopzington/anitools/pull/129)

## 2024-04-22
- Added notes filter

## 2024-04-19
- Added logic switches to filters that have AND logic by default so that after switching to OR any of the chosen values must match as opposed to all of them. Values in exclusion mode are not affected by the state.

## 2024-04-18
- Changed font used by the application and vertically aligned things properly

## 2024-04-17
- Added colored scrollbars and made them thinner in fat-free mode
- Some CSS fixes

## 2024-04-15
- Added Character and Staff to "Media Type" dropdown
- Updated dependencies
  - @yaireo/tagify from 4.21.1 to 4.24.0
  - datatables.net from 1.13.10 to 2.0.3
  - datatables.net-dt from 1.13.10 to 2.0.3
  - datatables.net-colreorder from 1.7.0 to 2.0.1
  - vite from 5.1.1 to 5.2.8
  - marked from 12.0.0 to 12.0.1

## 2024-04-03
- Fixed the 'Show activities' Button after breaking it with the previous update

## 2024-03-28
- The "User List" filter has been moved to the filter section and turned into a multi-selection with AND logic so you can now find overlap between multiple custom lists or even exclude things from certain lists by clicking on the selected entries to turn them red like with the Tags and Genres. With this change the BetterBrowse module no longer offered any additional benefits and thus hahs been removed. If you want to go through the entire database, simply empty the "User List" filter (or for example select "All" and turn it into exclusion mode which is the equivalent of AL's "Hide My Anime" checkbox on the Browse page).

## 2024-03-05
- Fixed tag styling after a tagify update broke it
- Updated dependencies
  - vite from 5.1.1 to 5.1.5

## 2024-02-13
- Updated dependencies
  - @yaireo/tagify from 4.19.1 to 4.21.1 [#100](https://github.com/Koopzington/anitools/pull/100)
  - datatables.net from 1.13.8 to 1.13.10 [#101](https://github.com/Koopzington/anitools/pull/101)
  - datatables.net-dt from 1.13.8 to 1.13.10 [#102](https://github.com/Koopzington/anitools/pull/102)
  - vite from 5.0.12 to 5.1.1 [#103](https://github.com/Koopzington/anitools/pull/103)

## 2024-02-06
- Updated dependencies
  - stylelint from 16.2.0 to 16.2.1 [#98](https://github.com/Koopzington/anitools/pull/98)
  - marked from 11.2.0 to 12.0.0 [#99](https://github.com/Koopzington/anitools/pull/99)

## 2024-01-30
- Modified some CSS to fix what the tagify update broke visually
- Updated dependencies
  - marked from 11.1.1 to 11.2.0 [#96](https://github.com/Koopzington/anitools/pull/96)
  - @yaireo/tagify from 4.18.3 to 4.19.1 [#97](https://github.com/Koopzington/anitools/pull/97)

## 2024-01-23
- Updated dependencies
  - @yaireo/tagify from 4.18.2 to 4.18.3 [#93](https://github.com/Koopzington/anitools/pull/93)
  - vite from 5.0.11 to 5.0.12 [#94](https://github.com/Koopzington/anitools/pull/94)
  - stylelint from 16.1.0 to 16.2.0 [#95](https://github.com/Koopzington/anitools/pull/95)

## 2024-01-18
- Lazyload cover images to reduce traffic
- Updated dependencies
  - @yaireo/tagify from 4.18.1 to 4.18.2 [#92](https://github.com/Koopzington/anitools/pull/92)

## 2024-01-15
- Added new "Started Airing" and "Finished Airing" filters which let people filter by specific date ranges or alternatively for media that started/finished airing in a specific month/day (eg. \*-01-\* => January only)
- Small CSS fix for titles going through the table header

## 2024-01-09
- Updated dependencies
  - @yaireo/tagify from 4.17.9 to 4.18.1 [#90](https://github.com/Koopzington/anitools/pull/90)
  - vite from 5.0.10 to 5.0.11 [#91](https://github.com/Koopzington/anitools/pull/91)

## 2024-01-02
- Added a new slider filter for the amount of main characters a media entry has [Commit]()
- Updated dependencies
  - stylelint-config-standard from 35.0.0 to 36.0.0 [#87](https://github.com/Koopzington/anitools/pull/87)
  - marked from 11.1.0 to 11.1.1 [#89](https://github.com/Koopzington/anitools/pull/89)

## 2023-12-19
- Reorganize column toggles [Commit](https://github.com/Koopzington/anitools/commit/38cb5728805a3db344f75058e74afc0ab325115a), [Commit](https://github.com/Koopzington/anitools/commit/799ccc0b2cd4c2d50b4090361be4f754ffef72bb)
- Added functionality to show errors [Commit](https://github.com/Koopzington/anitools/commit/02358ec710d1b9d99e1543cfbb86dd13f4076e07)
- Updated dependencies
  - marked from 11.0.1 to 11.1.0 [#84](https://github.com/Koopzington/anitools/pull/84)
  - vite from 5.0.7 to 5.0.10 [#85](https://github.com/Koopzington/anitools/pull/85)

## 2023-12-18
- Added metadata for search engines [Commit](https://github.com/Koopzington/anitools/commit/a4553a1c412231dc0c19947f036a0e305df8e9e2), [Commit](https://github.com/Koopzington/anitools/commit/a2c3bf421647ba240a6340098628aae138bbbb25), [Commit](https://github.com/Koopzington/anitools/commit/8665ea2810a616da629c5dedc8e05c62abc62407)

## 2023-12-15
- Updated dependencies
  - @fortawesome/fontawesome-free from 6.4.2 to 6.5.1 [#80](https://github.com/Koopzington/anitools/pull/80)
  - vite from 5.0.2 to 5.0.7 [#81](https://github.com/Koopzington/anitools/pull/81)
  - stylelint from 15.11.0 to 16.0.2 [#82](https://github.com/Koopzington/anitools/pull/82)
  - stylelint-config-standard from 34.0.0 to 35.0.0 [#82](https://github.com/Koopzington/anitools/pull/82)
  - marked from 10.0.0 to 11.0.1 [#83](https://github.com/Koopzington/anitools/pull/83)

## 2023-11-28
- Updated dependencies
  - vite from 5.0.0 to 5.0.2 [#77](https://github.com/Koopzington/anitools/pull/77)

## 2023-11-22
- Updated dependencies
  - vite from 4.5.0 to 5.0.0 [#74](https://github.com/Koopzington/anitools/pull/74)
  - datatables.net-dt from 1.13.7 to 1.13.8 [#75](https://github.com/Koopzington/anitools/pull/75)
  - datatables.net from 1.13.7 to 1.13.8 [#76](https://github.com/Koopzington/anitools/pull/76)

## 2023-11-14
- Updated dependencies
  - marked from 9.1.5 to 10.0.0 [#71](https://github.com/Koopzington/anitools/pull/71)
  - @types/wnumb from 1.2.2 to 1.2.3 [#72](https://github.com/Koopzington/anitools/pull/72)

## 2023-11-10
- Updated dependencies
  - marked from 9.1.3 to 9.1.5 [#69](https://github.com/Koopzington/anitools/pull/69)

## 2023-11-07
- Updated dependencies
  - datatables.net-dt from 1.13.6 to 1.13.7 [#67](https://github.com/Koopzington/anitools/pull/67)

## 2023-10-31
- Updated dependencies
  - marked from 9.1.2 to 9.1.3 [#66](https://github.com/Koopzington/anitools/pull/66)

## 2023-10-25
- Updated dependencies
  - stylelint from 15.10.3 to 15.11.0 [#63](https://github.com/Koopzington/anitools/pull/63)
  - vite from 4.4.11 to 4.5.0 [#64](https://github.com/Koopzington/anitools/pull/64)
  - @types/wnumb from 1.2.1 to 1.2.2 [#65](https://github.com/Koopzington/anitools/pull/65)

## 2023-10-21
- Updated dependencies
  - marked from 9.1.0 to 9.1.2 [#62](https://github.com/Koopzington/anitools/pull/62)

## 2023-10-10
- Updated dependencies
  - marked from 9.0.3 to 9.1.0 [#58](https://github.com/Koopzington/anitools/pull/58)
  - vite from 4.4.9 to 4.4.11 [#60](https://github.com/Koopzington/anitools/pull/60)
  - postcss from 8.4.27 to 8.4.31 [#61](https://github.com/Koopzington/anitools/pull/61)

## 2023-09-19
- Updated dependencies
  - marked from 9.0.0 to 9.0.3 [#57](https://github.com/Koopzington/anitools/pull/57)

## 2023-09-12
- Updated dependencies
  - marked from 8.0.0 to 9.0.0 [#56](https://github.com/Koopzington/anitools/pull/56)

## 2023-09-05
- Updated dependencies
  - marked from 7.0.5 to 8.0.0 [#55](https://github.com/Koopzington/anitools/pull/55)

## 2023-08-29
- Updated dependencies
  - marked from 7.0.4 to 7.0.5 [#52](https://github.com/Koopzington/anitools/pull/52)
  - jquery from 3.7.0 to 3.7.1 [#53](https://github.com/Koopzington/anitools/pull/53)

## 2023-08-23
 - @yaireo/tagify from 4.17.8 to 4.17.9 [#48](https://github.com/Koopzington/anitools/pull/48)
 - stylelint from 15.10.2 to 15.10.3 [#49](https://github.com/Koopzington/anitools/pull/49)
 - marked from 7.0.2 to 7.0.4 [#51](https://github.com/Koopzington/anitools/pull/51)

## 2023-08-19
- Updated dependencies
  - marked from 7.0.1 to 7.0.2 [#46](https://github.com/Koopzington/anitools/pull/46)

## 2023-08-08
- Linked Live version in README.md [Commit](https://github.com/Koopzington/anitools/commit/7e493545b57362d6960e9b48979a3490e107d3fe)
- Updated dependencies
  - vite from 4.4.7 to 4.4.9 [#43](https://github.com/Koopzington/anitools/pull/43)
  - marked from 6.0.0 to 7.0.1 [#44](https://github.com/Koopzington/anitools/pull/44)
  - @fortawesome/fontawesome-free from 6.4.0 to 6.4.2 [#45](https://github.com/Koopzington/anitools/pull/45)
  
## 2023-08-01
- Updated dependencies
  - datatables.net from 1.13.5 to 1.13.6 [#40](https://github.com/Koopzington/anitools/pull/40)
  - marked from 5.1.1 to 6.0.0 [#41](https://github.com/Koopzington/anitools/pull/41)
  - datatables.net-dt from 1.13.5 to 1.13.6 [#42](https://github.com/Koopzington/anitools/pull/42)

## 2023-07-25
- Updated dependencies
  - vite from 4.4.4 to 4.4.7 [#38](https://github.com/Koopzington/anitools/pull/38)
  - stylelint from 15.10.1 to 15.10.2 [#39](https://github.com/Koopzington/anitools/pull/39)

## 2023-07-19
- Updated dependencies
  - datatables.net-dt (1.13.4 to 1.13.5) [#35](https://github.com/Koopzington/anitools/pull/35)
  - marked (5.1.0 to 5.1.1) [#36](https://github.com/Koopzington/anitools/pull/36)
  - vite (4.4.3 to 4.4.4) [#37](https://github.com/Koopzington/anitools/pull/37)

## 2023-07-13
- Updated dependencies
  - stylelint-config-standard (33.0.0 to 34.0.0) [#29](https://github.com/Koopzington/anitools/pull/29)
  - datatables.net-colreorder (1.6.2 to 1.7.0) [#32](https://github.com/Koopzington/anitools/pull/32)
  - datatables.net (1.13.4 to 1.13.5) [#33](https://github.com/Koopzington/anitools/pull/33)
  - vite (4.3.9 to 4.4.3) [#34](https://github.com/Koopzington/anitools/pull/34)

## 2023-07-04
- Removed the "external links" column since you can filter by them [Commit](https://github.com/Koopzington/anitools/commit/7b14cec43dbdbd5e85536d57ad2d5783521d6424)
- Update URLs to studio/publisher/publication filter search [Commit](https://github.com/Koopzington/anitools/commit/0b05cf68febb98262b1adbaab7e2663ae5c918ad)
- Align BetterBrowse table dom with BetterList [Commit](https://github.com/Koopzington/anitools/commit/9ce714c3567bb5e773049ccc0689789a24297c53)

## 2023-06-27
- Updated dependencies
  - stylelint (15.8.0 to 15.9.0) [#28](https://github.com/Koopzington/anitools/pull/28)

## 2023-6-22
- Updated dependencies
  - nouislider (15.7.0 to 15.7.1) [#26](https://github.com/Koopzington/anitools/pull/26)
  - stylelint (15.7.0 to 15.8.0) [#27](https://github.com/Koopzington/anitools/pull/27)

## 2023-6-13
- Updated dependencies
  - marked (5.0.4 to 5.1.0) [#25](https://github.com/Koopzington/anitools/pull/25)

## 2023-06-09
- Filters now got assigned to media types. Season, Studio, Producer and Voice Actor filters won't be shown while looking at Manga anymore. "Episodes" turns into "Chapters" as well when switching.
- New Total Runtime filter for Anime
- New experimental Publisher, Publication and "Fully Scanlated" filters for Manga which is based upon data from MangaUpdates. However only a third of the AL data is currently covered by MU data. Comes with a warning next to it for the time being.
- BetterList now automatically reloads when switching between Manga and Anime
- Fixed issues happening while switching between BetterList and BetterBrowse multiple times

## 2023-06-07
- Updated dependencies
  - marked (5.0.3 to 5.0.4) [#24](https://github.com/Koopzington/anitools/pull/24)
  - standard (17.0.0 to 17.0.1) [#23](https://github.com/Koopzington/anitools/pull/23)
  - stylelint (15.6.2 to 15.7.0) [#22](https://github.com/Koopzington/anitools/pull/22)

## 2023-06-05
- Fixed an issue where filter values didn't change while switching between media types [#21](https://github.com/Koopzington/anitools/issues/21)
- Increased the width of the user list dropdown on desktop mode [Commit](https://github.com/Koopzington/anitools/commit/aff18375e48d7a9c50489cebcb05a97cdb8c2771)

## 2023-06-04
- Fixed a bug that caused the filter values not to update when changing the media type [Commit](https://github.com/Koopzington/anitools/commit/0f9313fd591c5ef7852cae9738fe0e832c9a4be7)

## 2023-05-31
- Fixed a bug causing user lists to not get replaced when changing media type and reloading [Commit](https://github.com/Koopzington/anitools/commit/3f4a2f749f13c8bb7f401c6ef2cddba7d338b92d)
- Removed Choices.js as a dependency [Commit](https://github.com/Koopzington/anitools/commit/3f4a2f749f13c8bb7f401c6ef2cddba7d338b92d)

## 2023-05-30
- Fixed a bug causing the Tool dropdown to not show values on Safari [Commit](https://github.com/Koopzington/anitools/commit/4901a5497d35604bf342794cd34445cb2fdf88c6)
- Updated dependencies
  - @popperjs/core (2.11.7 to 2.11.8) [#20](https://github.com/Koopzington/anitools/pull/20)
  - marked (5.0.2 to 5.0.3) [#19](https://github.com/Koopzington/anitools/pull/19)
  - vite (4.3.8 to 4.3.9) [#18](https://github.com/Koopzington/anitools/pull/18)

## 2023-05-25
- Added a button opening a dialog that showcases features which might not be obvious to users. [Commit](https://github.com/Koopzington/anitools/commit/36e19d1b99209195699790c294800ccb336fcdfa)
- Added CHANGELOG.md containing all changes that were made to the project [Commit](https://github.com/Koopzington/anitools/commit/36e19d1b99209195699790c294800ccb336fcdfa)

## 2023-05-23
- Updated dependencies.
  - vite (4.3.6 to 4.3.8) [#17](https://github.com/Koopzington/anitools/pull/17)
  - stylelint (15.6.1 to 15.6.2) [#16](https://github.com/Koopzington/anitools/pull/16)

## 2023-05-20
- Let the "Show covers on title hover" setting also show the covers on romaji and native titles. [Commit](https://github.com/Koopzington/anitools/commit/2b20159b124b51bf2ea4fbcc941d47a78cb43fb0)
- Fix a typo in the CSS causing backgrounds of dropdowns to have incorrect colors in dark mode. [Commit](https://github.com/Koopzington/anitools/commit/0cbfc5bc13a31250467c9be5b137a4258984e739)

## 2023-05-19
- Add new AWC Community List filter. [Commit](https://github.com/Koopzington/anitools/commit/d0e8887bbd179c3482d9619aaca3a83ac726299c)

## 2023-05-18
- Add setting to display media covers while hovering over title links. [Commit](https://github.com/Koopzington/anitools/commit/7ee13b94488882a93e4da9a12185ae03269dc1e8)
- Add ability to make filters exclude chosen options. [Commit](https://github.com/Koopzington/anitools/commit/fc26b3f62ebc26de680b6e901a9d90293049c20c)
- Add "favourites" and "producers" columns to BetterBrowse. [Commit](https://github.com/Koopzington/anitools/commit/8699a619e8f501f699fd5e973c8dc04f307e9b87)
- Make the super-linter workflow pick up the project's settings instead of their own defaults. [Commit](https://github.com/Koopzington/anitools/commit/a4aa87a8a1b40077b98e17b1bc1066c7bc05864f)

## 2023-05-17
- Update meta tags to make embeds say that they're linking to AniTools. [Commit](https://github.com/Koopzington/anitools/commit/954ad736b3f3050b766480b9c381e8f647d66ccc)
- Add deployment workflow to host the project on GitHub Pages. (https://anitools.koopz.rocks) [Commit](https://github.com/Koopzington/anitools/commit/fb3fcb458bb451852c457aa1b7fcf125fdb7e4ba)

## 2023-05-16
- Initial Release. [Commit](https://github.com/Koopzington/anitools/commit/6104ccba3d0dd92d51b2f30a945d52c8704d984e)