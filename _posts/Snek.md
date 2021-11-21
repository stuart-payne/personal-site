---
title: "Snek"
date: 2021-10-29T15:32:54+01:00
draft: false
---
I started this project with the goal to recreate the classic game Snake in Unity with a few twists. First, I wanted most parts of the game to be configurable like the size of the grid that the snake moves within, the speed at which the snake moves etc. This allowed to easily make different difficulty levels without manually creating different boards or writing code for each difficulty.  Secondly, I added a second mechanic of spawning in additional obstacles for the player, "rocks" and also allowed the rate (or if they spawn at all) to be driven again by the difficulty parameters.

The end result can be played [here](https://play.unity.com/mg/other/snek-6xio) with the full source code and downloadable Unity project available [here](https://github.com/stuart-payne/Snek).

In general I am happy with how the game turned out. If I wanted to pour more time into it, I work on making it more visually appealing, creating new sprites for the apple, rocks and then implementing a system to render the snake with it's twists and turns. 

I also tried to keep the code as simple as possible, keeping each part as seperated as possible but there were a few problems that made this hard to maintain. An example would be choosing where to spawn the apple. I initially made it so it could simply spawn anywhere on the grid where there was a free space. However, once I started spawning in rocks it became apparent that it was possible to spawn apples in places where it was either impossible for the player to reach or the player would be forced to kill the snek if they attempted to eat the apple. 

Another example was the rock spawning, again it would be nice if the spawner would only depend on the board and it would just chose to spawn rocks anywhere there is an empty space. Again, this turned out to be a problem as this meant it was impossible to spawn a rock directly in front of the player, leaving them with a very short reaction time to move out of the way. It didn't feel fair at all. So I fixed this by making an exclusion zone around the head of the snake that made those pieces unavailable for spawning rocks.

If you are interested in reading more about this project, I will be writing some more articles going into more depth on this project (if there don't alrady exist here).