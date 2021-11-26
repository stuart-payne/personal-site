---
title: "Stat Collection"
date: 2021-10-13T13:16:50+01:00
draft: false
summary: "Making a generic stat collection for my enemies and towers that comes with lots of nice features."
---

The game in this article can be played [here](https://play.unity.com/mg/other/prototd-8) and github [here](https://github.com/stuart-payne/ProtoTD)

In ProtoTD, Towers and enemies have numeric values that adjust thei behaviour. Simple things like the speed which they travel at, the frequency that they fire and how much damage they can take before they die. These can be easily hard coded into the game and that is what I did initially but the problem with this approach is that it becomes rigid as you add mopre to the game and makes it hard to make design changes. If you decide you don't want a stats to exist anymore or you want to add a new one, this all has to be coded, increasing the work required and much slower iteration.

In addition to this, I wanted towers to be able to apply modifiers to the enemy's stats such as a tower slowing an enemy or increasing the amount of damage the enemy takes from other attacks. This would give me a wider range of towers that are possible and increase the amount of decisions the player can make and decide how he/she wants to deal with enemies. This again, is tough to do with hard coded stats as if I wanted to apply status effects, I would need to store the values in some variable somewhere and then need to go to each place where the stats are used and make sure the status effect is properly applied. It's annoying and adds work to any change you want to make and discourages experimentation.

So what I decided to do was to make an object that meets these requirements:

1. Stores the values of any stat. It needs to be able to handle new stats without any additional code. Each stat much also have a current value which can change at runtime while also remembering it's base value (what it was initially set to).
2. Each stat can have a modifier applied to it for a given duration. So if I want to apply a slow to an enemy, I can say what stat I want to modify, the amount modified by and a time duration and it will do what is expected, returning the value back to what it was before.
3. The ability to listen to values and give a callback that will be executed when a supplied condition is met e.g. when health is 0 or less, die.

The solution which I created is a single StatContainer object that consists internally or three parts.

-   `StatContainer<T>` The object itself that is a generic that only accepts enums. The enum is how the stats are defined.
-   `StatValue` This object is what handles the value of the stats. This contains the base value, current value and importantly the mechanism for listening to value changes. These are then stored in a dictionary with the key being the enum of the stat.
-   `StatusEffects<T>` This handles the status effects and is initiallized with the same enum that's used to create the StatContainer.

Lets look at some of the code.

## StatContainer

Here is the important code in this containers:

```csharp
public readonly StatusEffects<T> StatusEffects;
private Dictionary<T, StatValue> m_Values = new Dictionary<T, StatValue>();

public int this[T stat]
{
 get => (int)(m_Values[stat].CurrentValue * StatusEffects[stat]);
 set => m_Values[stat].CurrentValue = value;
}
```

I used an indexer (starting line 4) to allow easy access to the values we would normally want like this `stats[EnemyStats.Speed]` and we will get the value from the dictionary without needing to know anything about the underlying structure. An indexer is also used in the StatusEffect object and you can see in line 5 that we get that value and use it for the returned value from StatContainer's indexer meaning that the status effect are automatically applied if one exists.

The following line is what allows us to limit the generic to only accept an Enum.
`public class StatContainer<T> where T: Enum`

I can then get the base values using with a simple one liner:
`public int GetBaseValue(T stat) => m_Values[stat].BaseValue;`

Then there is the listening mechanism and for that, we have to look into the StatValue object.

```csharp
public class StatValue
{
	 public readonly int BaseValue;
	 public int CurrentValue
	 {
		 get => m_CurrentValue;
		 set
		 {
		 m_CurrentValue = value;
		 OnValueChanged();
		 }
	 }
	 private int m_CurrentValue;
	 private Dictionary<object, ListenerProperties> m_Listeners = new Dictionary<object, ListenerProperties>();
	 private void OnValueChanged()
	 {
		foreach(var listener in m_Listeners)
		 {
			 if (listener.Value.Condition(m_CurrentValue))
			 listener.Value.Callback();
		 }
	 }
	 // more code below
 }
```

Each value is controlled by a property that wehn we set it, it triggers the OnValueChanged method. Here we then iterate through a collection of `ListenerProperties` which is a private class shown below:

```csharp
private class ListenerProperties
{
	 public ListenerProperties(Func<int, bool> condition, Action callback)
	 {
		 Condition = condition;
		 Callback = callback;
	 }
	 public readonly Func<int, bool> Condition;
	 public readonly Action Callback;
}
```

This contains both the conditional which is any function that returns a bool and takes an int so that when a value is changed, we call each ListenerProperties object and run the new value through this function, if it returns true, we call the callback.

We create `ListenerProperties` by calling `AddListener` on a StatValue. On the StatContainer we also have a `AddListener` that takes a Stat enum and then looks into the dict containing the StatValues and then registers the listener to the correct stat.

```csharp
public void AddListenerToStat(T stat, object listener, Func<int, bool> condition, Action callback)
{
	m_Values[stat].AddListener(listener, condition, callback);
}

public void RemoveListenerToStat(T stat, object listener)
{
	m_Values[stat].RemoveListener(listener);
}
```

With that, I can now listen to stats for certain events. An example of how this is used in the code is the following from the Enemy class:

```csharp
private void Start()
{
	Stats.AddListenerToStat(EnemyStat.Health, this, DeathCheck, Die);
}

private bool DeathCheck(int health)
{
	var check = health <= 0;
	return check;
}

private void Die()
{
	OnDeathEvent?.Invoke(Stats);
	Instantiate(m_DeathEffect, transform.position, m_DeathEffect.transform.rotation);
	Destroy(gameObject);
}
```

The final piece is how status effects are implemented, including handling the duration of them.

```csharp
public class StatusEffects<T> where T: Enum
{
	 private Dictionary<T, float> m_Modifiers = new Dictionary<T, float>();
	 private Dictionary<T, Coroutine> m_StatusDurations = new Dictionary<T, Coroutine>();
	 // more code below
 }
```

There are two dictionaries which is the underlying data structures in this class. The modifiers (how much a status effect effects the stat) and then a dictionary for the coroutines where each coroutine is defined as the following:

```csharp
IEnumerator DurationCoroutine(float duration, T stat)
{
	yield return new WaitForSeconds(duration);
	m_Modifiers.Remove(stat);
	m_StatusDurations.Remove(stat);
}
```

We then add a status effect with the following method:

```csharp
public void Add(T stat, float modifier, float duration)
{
	 // We need to know if a modifier already exists and decide which then lasts.
	 if(m_Modifiers.ContainsKey(stat))
	 {
		 // if current modifier is larger than one being applied, we don't want to overwrite it so just return
		if (m_Modifiers[stat] > modifier)
			return;
		 // Stop old coroutine as a new duration will be made and the previous modifier will be overwritten
	 	m_CoroutineHandler.StopCoroutine(m_StatusDurations[stat]);
	 }
	 m_Modifiers[stat] = modifier;
	 m_StatusDurations[stat] = m_CoroutineHandler.StartCoroutine(DurationCoroutine(duration, stat));
}
```

As a design decision, I chose that it's only possible to have one status effect at a time. You can't have two slows on the same enemy instead, the status effect that has the highest modifier is kept, overwriting the old one or throwing away the new depending on which is larger.

The last important part is the indexer:

```csharp
public float this[T stat] => m_Modifiers.TryGetValue(stat, out m_Value) ? m_Value : 1.0f;
```

What is interesting about this is that if there is no value assigned to the key that is being accessed in the modifier dictionary, we still return the value of 1.0f. This is why we can have `(m_Values[stat].CurrentValue * StatusEffects[stat])` in the stat container as no status effect just means we don't have to modify the value and that is what 1.0f represents, otherwise we would have to check for null and the code would be messier.

And there we have it, we have a generic container that meets the requirements stated at the start of the article. In the game, it is used for both the Tower stats and Enemy stats with the only difference between the two is the enum used to initialise the object.

The code in this article isn't everything in the classes, if you are interested in seeing the full code it can be found here:

-[StatContainer](https://github.com/stuart-payne/ProtoTD/blob/master/Assets/Scripts/StatContainer.cs) -[StatusEffects](https://github.com/stuart-payne/ProtoTD/blob/master/Assets/Scripts/StatusEffects.cs)
