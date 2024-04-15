<center>
    <a href="https://anitools.koopz.rocks/">
        <img src="https://anitools.koopz.rocks/android-chrome-512x512.png" width="250"><br>
        <h1>AniTools Frontend</h1>
    </a>
</center>

![License](https://img.shields.io/github/license/koopzington/anitools)
[![Githhub Issues](https://img.shields.io/github/issues/koopzington/anitools)](https://github.com/Koopzington/anitools/issues)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![GitHub Super-Linter](https://github.com/koopzington/anitools/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)


Collection of tools for AniList's [Anime Watching Club](https://anilist.co/forum/thread/4449). Over the years of actively participating in the community i've created various things that made planning out challenges easier. However they're all separate HTML files and available under various URLs much to the confusion of other users. This project's goal is to unify all of them into a single website.

This is the repository for the frontend. The backend repository is located [here](https://github.com/Koopzington/anitools-backend).


## Migration Roadmap

- [X] [BetterList](https://koopz.rocks/betterlist/) - A table of an AniList user's anime which provides additional filtering features not provided by AniList itself
- [X] [BetterBrowse](https://koopz.rocks/betterlist/better-browse.html) - The same as above but for the entire AniList database, basically competing against [AniList's Browse function](https://anilist.co/search/anime)
- [X] [BetterCharacters](https://koopz.rocks/betterlist/better-characters.html) - Still very expiremental derivate of BetterBrowse pointed at characters since [AniList devs started introducing fields for them](https://anilist.co/forum/thread/3878/comment/811888). At the point of writing this the API doesn't have any way to query those yet. Another derivate is yet to be created for staff members
- [ ] [Challenge Updater](https://koopz.rocks/awc-updater/) - A little tool that updates a participant's challenge code and replaces title and date placeholders with data from the AL API
- [ ] [Interactive Jigsaw Helper](https://koopz.rocks/betterlist/jigsaw-interactive.html) - Another tool that heavily helps sorting out the [Jigsaw Puzzle Challenge](https://anilist.co/forum/thread/11405) because doing it manually is a massive pita
- [ ] [Challenge Editor](https://koopz.rocks/monaco) - Really just Monaco with AWC specific syntax highlighting.
