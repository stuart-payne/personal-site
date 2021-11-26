---
title: "The Ticker"
date: 2021-10-29T15:33:34+01:00
draft: false
---

WebGL build of Snek can be found [here](https://play.unity.com/mg/other/snek-tgk7)  
Full source code and downloadable Unity project available [here](https://github.com/stuart-payne/Snek)

One of the first problems I had to tackle on my Snake game was the problem of time. How does my game handle when things happen? How fast should the snake move? How often should I spawn a rock? Should this be configurable and how would I acheive that?

A common approach to this in Unity is having each monobehaviour that cares about time to use it's Update event function with Time.deltaTime. So if I wanted to make the snake move every second, I could have a field that caches the accumalated time, then add the deltaTime to this every frame and then move the snake every time it hits a multiple of 1. This works but there are a few reasons why I avoided this. Firstly, in the game snake, stuff only ever happens when the snake moves, in between moves there is no behaviour. Therefore, it seems wasteful to be making checks and calculation every frame in an Update event when instead I could just do them every time the snake moves. Secondly, if I want to allow the time in which everything steps forward to be configurable but each monobehaviour is handling time on it's own, I would need to pass each monobehaviour a time value which it then handles individually. Again, this works but it doesn't feel like the easiest way or ocrrect way.

So I decided to do away with the Update function completely, not using it anywhere in the game and instead have only one monobehaviour that was time aware and use this to inform all classes that need to know that the game has moved one step forward or in other words, that the game was "ticked". My Ticker was born.

This is the class in full:

```csharp
public class Ticker : MonoBehaviour
{
	private float m_TickRate;
	private IEnumerator m_TickCoroutine;
	private List<ITickable> m_Tickables;

	private void Awake()
	{

		m_Tickables = new List<ITickable>();
	}

	public void SetTickRate(float tickRate) => m_TickRate = tickRate;

	public void StartTick()
	{
		m_TickCoroutine = Tick(m_TickRate);
		StartCoroutine(m_TickCoroutine);
	}

	public void StopTick()
	{
		StopCoroutine(m_TickCoroutine);
	}

	public void AddTickable(ITickable tickable) => m_Tickables.Add(tickable);
	public void RemoveTickable(ITickable tickable) => m_Tickables.Remove(tickable);

	IEnumerator Tick(float secondsPerTick)
	{
		while (true)
		{
			yield return new WaitForSeconds(secondsPerTick);
			foreach (var tickable in m_Tickables)
			{
				tickable.Tick();
			}
		}
	}
}
```

The `TIck` method is the main part of this class. Returning an `IEnumerator` this is a coroutine that infinitely loop with each iteration waiting for a specified amount of time whish is a parameter of the method. All it then does is iterate through the container `m_Tickables` and calls the `TIck` method on these objects.

`m_Tickables` is a list of type `List<ITickable>`. `ITickable`, as the name suggests, is an interface with the following code:

```csharp
public interface ITickable
{
	public void Tick();
}
```

This allows me to give my TIcker any object that implements the `ITickable` interface and then the object can define it's own behaviour on each tick. An example in the game is the GameManager class implements the ITickable interface and while is is responsible for setting up the Ticker, it also registers itself to be ticked so that it can drive other behaviour in the game which it has to manager.

```csharp
public class GameManager : MonoBehaviour, ITickable
{
	public void Tick()
	{
		TickEvent?.Invoke();
	}
}
```

The GameManager internally uses an event when Tick is called as there are multiple parts of the GameManager that triggers behaviour on Tick but of course, the ticker doesn't need to know any of these details, that is up to each ITickable class.

Using this event, the GameManager then moves the snake, giving it the input it's taken from my GameInput class and then keeps track of the amount of ticks that have occured, telling the RockSpawner to spawn a rock every specified amount of ticks.

The way the Ticker class is made also lends itself to very easy unit testing. Within my TickerTest class I have this code:

```csharp
[UnityTest]
public IEnumerator WillStopTickingTickableAfterRemoval()
{
	var ticker = SetupTicker(0.2f);
	var tickableToStay = new TestTickable();
	var tickableToBeRemoved = new TestTickable();

	ticker.AddTickable(tickableToStay);
	ticker.AddTickable(tickableToBeRemoved);
	ticker.StartTick();

	yield return new WaitForSeconds(0.3f);
	ticker.RemoveTickable(tickableToBeRemoved);
	yield return new WaitForSeconds(0.3f);

	Assert.IsTrue(tickableToStay.TickCount == 2);
	Assert.IsTrue(tickableToBeRemoved.TickCount == 1);
}

private class TestTickable : ITickable
{
	public int TickCount = 0;
	public void Tick() => TickCount++;
}

private Ticker SetupTicker(float tickRate)
{
	var tickerObj = new GameObject();
	var ticker = tickerObj.AddComponent<Ticker>();
	ticker.SetTickRate(tickRate);
	return ticker;
}
```

This tests my ability to Add and Remove ITickable objects from the Ticker and ensure that it still ticks what it's meant to and stops ticking the item removed. The testing of this behaviour is made easy as I can implement the class TestTickable as an ITickable and use the TIckCount it has to verify whether the Tick method has been called or not.

In conclusion, this object allows me to control the speed of the game through one place, easily unit test, removes the need to use Update in any of my monobehaviours and even give me the abilty to pause, restart or even change the speed of the game during runtime for free. A success!
