# Changelog

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