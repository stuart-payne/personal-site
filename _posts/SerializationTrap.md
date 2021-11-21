---
title: "The Serialization Trap"
date: 2021-10-18T13:16:50+01:00
draft: false
summary: "A story on a confusing bug caused by the quirks of Unity's serialization and a small mistake."
---

In my previous article, I described the container I made to deal with stats and status effects. The goal was to make it easy for me to add and modify stats without the need to hard code each new stat and how it is contained and dealt with.

Having completed writing it's code, I then wrote unit tests, both edit and play mode, to ensure it behaved as I hoped. After fixing some bugs, it did as I intended and I felt happy with myself. The next step was to change the data that towers use to allow it to be able to apply status effects to it's attacks.

For my tower data, I used Scriptable Objects to store the data, the class is as follows:

```csharp
public class TowerStatsSO : ScriptableObject
{
	 public string Name;
	 public int Cost;
	 public int Damage;
	 public float FiringCooldown;
	 public float FiringRange;
	 public bool AppliesStatusEffect;
	 public StatusEffect<EnemyStat> StatusEffect;
	 public Strategy DefaultStrategy;
	 public Strategy[] PossibleStrategies;
}
```

Scriptable Objects in Unity allow you to create an object that acts as an asset in your project. This means you can save multiple instances of these in your project and then reference them in your scenes. An additional benefit is that you get an out of the box inspector for the objects allowing easy editing thanks to Unity's serialization. I want to point some attention to the bool AppliesStatusEffects. This might seem unneccessary as surely I can just have StatusEffect be null and that will tell me that the tower does not apply a StatusEffect. Unfortunately, no. A quirk of Unity's serialization, which it will do to any public field, is that it can't be null. If you do set the value to anything, when Unity then serializes it for the editor, it will give it a value and that will be used within your scene where it referenced. Therefore I check the bool first to see if the tower does apply a StatusEffect and if it does, when the tower fires, it will apply the effect to the enemy's stats.

Having set that up and then made the logic on the towers for applying the status effect, I tested it in game and was pleased to see when the tower was set to slow the enemy, I observed the effect in game with the enemy being slowed for the correct amount and for the right duration. My happiness was short lived as when I then tried one of my towers that did not apply a status effect, something happened which I simply couldn't explain. No matter how much health the enemy had, whenever the tower hit the enemy, the enemy instantly died.

This was a huge problem and the worst part of it was that there appeared to be nothing wrong with the health of the enemies. The stat container which then seemed to be the next obvious culprit was passing all of it's unit tests which led me to question whether I had made mistakes in the tests themselves but they all held up to scrutiny.

After a few hours of questioning my sanity, I found out what was going on, a rogue public field and Unity's serialisation was causing this strange behaviour and here is how.

First, I need to talk about how my projectile turret (the tower I tested the status effects with initially) was applying the status effect. When it fires at a target, it instantiates a projectile and then sets a status effect field on the projectile if the AppliesStatusEffect bool is true. If it's not true nothing gets set and the public field is left null. This is what I'd missed. The field was getting serialized and it was not ending up null at runtime, making the tower apply some status effect that essentially the serialization was creating.

Ok, but how does this status effect lead to the enemy instantly dying? A series of unfortunate events. The StatusEffect object looks like this:

```csharp
[Serializable]
public class StatusEffect<T> where T: Enum
{
	 public T Type;
	 public float Intensity;
	 public float Duration;
}
```

When left as null, Unity serializes it to have these values:

![Image](/Serialize.png)

The enemy health stat is being chosen with a modifier of 0. Uh oh. Our enemy class listens to the health stat with this code:

```csharp
private void Start()
{
	//other code
	Stats.AddListenerToStat(EnemyStat.Health, this, DeathCheck, Die);
}

private bool DeathCheck(int health)
{
	return health <= 0;
}
```

The death check is called every time the enemy's health changes. the modifier causes the health to return as 0. So every time a tower hits, it applies the status effect of 0 health, the DeathCheck returns true causing the Die callback to be called.

So, how can this be avoided? The easy fix is to change the projectile field to private. The reason in the first place that it was public was so that it was accessible to other classes. This can still be acheived through a property or a method. I chose a property looking like this:

```csharp
public StatusEffect<EnemyStat> StatusEffect { get; set; }
```

This will not get serialized. Hurray!

Another thing we can do to avoid this happening again is the use of Unity's attributes that you can add to serialized fields, limiting what values can be assigned to them through serialization and the inspector like so:

```csharp
public class StatusEffect<T> where T: Enum
{
	public T Type;
	[Range(0.1f, 2.0f)]
	public float Intensity;
	public float Duration;
}
```

The Range attribute sets a minimum and maximum value that the field can be. It then appears in the inspector like this:

![RangeAttirbute](/RangeAttribute.png)

Now, we get a nice inspector widget which lets us set it to a reasonable value and it guards us against problematic values like 0 or a minus.

In conclusion, be very careful when using public fields in Monobehaviours and be aware that if you are purposefully allowing a value to be serialized, know that it will never be null and consider using attributes to stop values being set to it that might cause problems.

Thank you for reading!
