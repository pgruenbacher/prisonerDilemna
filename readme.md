## Synopsis

At the top of the file there should be a short introduction and/ or overview that explains **what** the project is. This description should match descriptions added for package managers (Gemspec, package.json, etc.)

## The Game

Due to complexity of game, refresh was chosen over building complicated timeout functions. There is no server code besides the firebase database, so the game relies on each player's browser to trust and handshake with one another. 

Players can edit their name in top left corner, whatever they type or edit is automatically saved. If it doesn't change on a different screen after editing, try refresh. 

For each play, choose hawk or dove. Once both have chosen, points will be assigned according to rules, which can be changed on the database by teacher.

Each round has a limited number of plays. After around ~25 or however specified, players will (hopefully) be matched against new players. IF YOUR ARE NOT MATCHED WITH A PLAYER AFTER SOME TIME, SIMPLY TRY REFRESHING YOUR BROWSER.

THERE IS NO TIME LIMIT TO PLAYS: if opponent is not playing, try refreshing as well. 

Player leaderboard is by total points and # of games. Try clearing the database manually @firebase.com if you want to have a fresh start of the leaderboard. 

## Motivation

Quick demo of the hawk / dove game theory.

## Testing

In order to test, simply pull up two browsers and see if you can play against yourself.

##Developing
To develop, check out the ionic generator by yeoman for the grunt commands. You'll also want to have node installed already with grunt, yo, etc.

## Contact

issues? contact pgruenbacher@gmail.com

owner of the firebase database is Rathman.1@osu.edu; 

## License

Free for personal and commercial