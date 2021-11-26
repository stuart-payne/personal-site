---
title: "Multiple Difficulties"
date: 2021-10-29T15:34:13+01:00
draft: false
---

WebGL build of Snek can be found [here](https://play.unity.com/mg/other/snek-6xio)  
Full source code and downloadable Unity project available [here](https://github.com/stuart-payne/Snek)

One of my goals when making this game was to support multiple difficulties. This is a very common feature in most games, allowing players of varying skill levels to enjoy a game in the way they want to. Now, Snake isn't a complicated game but I still wanted to implement this feature in a manner that didn't require to write additional code for each difficulty.

The approach I chose was a data driven one. Most of the components of the game have parameters that change some behaviour:

-   The board that the snake moves on is generated at runtime with the height and width of the grid being parameters to it's Generate method.
-   The Ticker that controls the flow of the game has a tickRate field which the coroutine uses for the `WaitForSeconds` call.
-   The RockSpawner is called by the GameManager to spawn rocks which makes the call to spawn a rock at a rate that can be changed or switched off.
-   On game start, a UI is presented to the player which generates buttons for the player to chose which difficulty they want to play.

With this dynamisn and runtime generation I then needed to define this in some form of object, a way of getting this data from a source like a file and a mechanism to feed the data to the components that need it.

First part, we have the Difficulty class which is basically just a serializable data container:

```csharp
[Serializable]
public class Difficulty
{
	public string Name;
	public float SecondsPerTick;
	public int TicksPerStoneSpawn;
	public int GridXSize;
	public int GridYSize;
}

[Serializable]
public class DifficultyArray
{
	public Difficulty[] Difficulties;
}
```

I also included a DifficultyArray class in the code above. This might seem redundant as you could just have a `Difficulty[]` however, as the data format we are storing the difficulties in is JSON, the Unity JsonUtility class that is used for loading JSON files does not support arrays as the root element in JSON and therefore we need this class to work around that fact.

Then we can look at the JSON file that we load in at runtime:

```json
{
    "Difficulties": [
        {
            "Name": "Easy",
            "SecondsPerTick": "0.6",
            "TicksPerStoneSpawn": "0",
            "GridXSize": "10",
            "GridYSize": "10"
        },
        {
            "Name": "Normal",
            "SecondsPerTick": "0.3",
            "TicksPerStoneSpawn": "30",
            "GridXSize": "12",
            "GridYSize": "12"
        },
        {
            "Name": "Stupid",
            "SecondsPerTick": "0.15",
            "TicksPerStoneSpawn": "15",
            "GridXSize": "16",
            "GridYSize": "16"
        }
    ]
}
```

This can be directly deserialised to the Difficulty objects thanks to the Serializable attribute so a simple parser like below gets us what we need:

```csharp
public class DifficultyParser : IDifficultyProvider
{
	private const string m_FileName = "Difficulty.json";

	public Difficulty[] GetDifficulties()
	{
		var path = Path.Combine(Application.streamingAssetsPath, m_FileName);
		string json;
		using (StreamReader r = new StreamReader(path))
		{
			json = r.ReadToEnd();
		}
		var difficultyArray = JsonUtility.FromJson<DifficultyArray>(json);
		return difficultyArray.Difficulties;
	}
}
```

Just a note, Unity destroys all of your folder structure in your project at build time with the exception of one directory name and that's `StreamingAssets`. So if we put the json file in this directory, we will be able to access it at runtime with `Application.streamingAssetsPath` as the path + file name.

With the data being loaded and parsed into Diificulty objects, the buttons for each difficulty on the initial game startup UI can be created for each entry in the json file. When the user then presses the button, it called SetupGame in the GameManager which looks like this:

```csharp
public void SetupGame(Difficulty difficulty)

{
	BuildBoardWithDifficulty(difficulty.GridXSize, difficulty.GridYSize); // <----
	m_Ticker.SetTickRate(difficulty.SecondsPerTick); // <----
	m_Snek.FinishedSpawningEvent += m_AppleSpawner.SpawnNewApple;
	m_Snek.SpawnStartingBody();
	m_Snek.AppleEatenEvent += m_AppleSpawner.SpawnNewApple;
	m_Snek.DeathEvent += () => Debug.Log("DEAD SNEK");
	m_Snek.DeathEvent += OnSnekDeath;
	SetRockSpawnRate(difficulty.TicksPerStoneSpawn); // <----
	TickEvent += MoveSnek;
	m_Ticker.AddTickable(this);
	m_Ticker.StartTick();
}
```

Where I've put the comments with arrows is where the difficulty values are being fed to the components that need them. The game is then built around these values and voila, I acheived what I set out to do.

Except for one problem. Building to WebGL (which is the main way I've made this available) means that there is no file system as it's running in a browser so this means on this platform we need a different way to handle it. Luckily, it doesn't require much to allow for this. In the GameManager Awake event method, I have this:

```csharp
private void Awake()
{
#if UNITY_WEBGL
	IDifficultyProvider difficultyParser = new StaticDifficulties();
#else
	IDifficultyProvider difficultyParser = new DifficultyParser();
#endif
	Difficulties = difficultyParser.GetDifficulties();
}
```

Using the directives, I can use the code that I have already talked about on all platforms except WebGL and use a alternative solution for WebGL. As I am using an interface, I created the StaticDifficulties class to provide the difficulties in this situation without the need for code changes. The class looks like the following:

```csharp
public class StaticDifficulties : IDifficultyProvider
{
	public Difficulty[] GetDifficulties()
	{
		return new[]
		{
			new Difficulty
			{
				Name = "Easy",
				SecondsPerTick = 0.6f,
				TicksPerStoneSpawn = 0,
				GridXSize = 10,
				GridYSize = 10,
			},
			new Difficulty
			{
				Name = "Normal",
				SecondsPerTick = 0.3f,
				TicksPerStoneSpawn = 30,
				GridXSize = 12,
				GridYSize = 12,
			},
			new Difficulty
			{
				Name = "Stupid",
				SecondsPerTick = 0.15f,
				TicksPerStoneSpawn = 10,
				GridXSize = 16,
				GridYSize = 16,
			}
		};
	}
}
```

As it says on the tin, it's just static data. It isn't ideal but means we still support the dynamism on other platforms and keep the same code for WebGl.
