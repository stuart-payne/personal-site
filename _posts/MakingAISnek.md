---
title: "Getting Snek to Play Itself"
date: 2021-11-04T15:29:08Z
draft: false
---

Recently I have been exploring the world of pathfinding. My interest began when trying to find out what I wanted to do for my next personal project and I wanted to pursue something Game AI related. After reading up on the predominant types of AI that exist currently in games, examples being FSMs, behaviour trees and GOAP, there was one topic that seemed integral to all of it. Pathfinding!

So I made a small project where I could build a grid then convert that grid into a graph that a pathfinding algorithm could use and then visually represent the path found on the grid.

Here are some gifs to show the results:

Breadth fill that exits on first path found:

![Image](/BreadthFill.gif)

A\*:

![AStar](/AStar.gif)

Creating obstacle for the pathfinder to navigate around:

![Obstacles](/Obstacles.gif)

As this code works on grids, I had the idea to implement the pathfinding in my Snek game and allow the option to replace the user input with an AI input that finds a path from the snake's head to the apple. After a small amount of pain making sure the path evaluation and walking along the returned path was syncronised with the snake movement and also dealing with the fact that the grid wraps (effectively making it a donut) I got it to work! [You can play the result here.](https://play.unity.com/mg/other/snek-tgk7).

Here is a gif of it in action:

![Snek](/Snek.gif)

It's works fairly well but is far from perfect. There are situations where the snake will wrap around itself and cause there to be no available path where it is programmed to fallback to moving in a straight direction, eventually losing. A human player would know to try to create space by moving the snake around until there is a path to the apple but getting the game to be able to do that will require much more than simple pathfinding.

Regardless of the imperfections, I'm happy with the results and honestly, it's almost therapeutic watching the game play itself. Thank you for reading.

Full code of both projects are here:

- [Snek](https://github.com/stuart-payne/Snek)
- [Pathfinding](https://github.com/stuart-payne/Pathfinding)
