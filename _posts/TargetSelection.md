---
title: "Target Selection"
date: 2021-10-13T12:46:51+01:00
draft: false
summary: "How I solved the problem of target selection in my tower defence game and allowed for multiple targetting strategies."
---

The game in this article can be played [here](https://play.unity.com/mg/other/prototd-8) and github [here](https://github.com/stuart-payne/ProtoTD)

One of the first problems I needed to tackle in making my little tower defence game, ProtoTD, was the towers target selection. The problem can be broken down into simple steps:

1. How does the tower know what it can target?
2. Assuming the tower can only target one thing, if there are multiple candidates that match the tower's targetting criteria, which one does it choose?
3. Should the tower have multiple targetting criteria that the user can change?

To solve the first problem, I chose colliders to drive the solution. The enemies have rigidbodies and a collider which allows it to interact with other colliders. The tower then has a sphere collider that is representative of it's targetting range (which is variable and can be upgraded by the player). When an enemy collider comes into contact with this collider on the tower, it registers itself to the target selector object on the tower where the tower keeps a list of enemies. The enemy then will tell the tower to remove it from the list if it leaves the collider or dies so the tower then knows it can't be targetted anymore which is especially important if the enemy object doesn't exist anymore and would leave a dangling reference otherwise.

Here are some code examples of this being implemented:

```csharp

private void OnTriggerEnter(Collider other)
{
 if (other.CompareTag("TowerRange"))
 {
     var tower = other.GetComponentInParent<BaseTower>();
     tower.RegisterTarget(this);
     m_TowersTargetedBy.Add(tower);
 }}
```

```csharp
private void OnTriggerExit(Collider other)
{
   if (!other.CompareTag("TowerRange")) return;
   var tower = other.GetComponentInParent<BaseTower>();
   tower.DeregisterTarget(this);
   m_TowersTargetedBy.Remove(tower);
}
```

```csharp
private void OnDestroy()
{
    foreach (BaseTower tower in m_TowersTargetedBy) tower.DeregisterTarget(this);
}
```

m_TowersTargetedBy is a collection that the Enemy object keeps to keep track of what tower it has registered to. This then allows it to Deregsiter it once it leaves that collider or dies. The collection used is a HashSet due to not wanting duplicates and the need to lookup the tower within the collection.

On the tower end, the Register and Deregister methods are very simple:

```csharp
public void RegisterTarget(Enemy target) => m_TargetSelector.AddTarget(target);

public void DeregisterTarget(Enemy target) => m_TargetSelector.RemoveTarget(target);
```

Where in the TargetSelector AddTarget and RemoveTarget methods are just adding and removing them from a list.

This mostly covers all we need to allow our towers to know what it can target. The next step is getting them to pick a target to shoot at. First we need to decide to when a target should be chosen. The solution we are going to use requires sorting of our targets which can be quite costly so we want to consider reducing the amount we have to do it.

We need to look at how a tower decides when it's ready to fire.

```csharp
protected virtual void Update()
{
	if (m_ReadyToShoot)
	{
		if (m_TargetSelector.SelectTarget())
		{
			Fire();
			m_ReadyToShoot = false;
			StartCoroutine(ShootCooldown());
		}
	}
}

protected abstract void Fire();

private IEnumerator ShootCooldown()
{
	yield return new WaitForSeconds(Stats.FiringCooldown);
	m_ReadyToShoot = true;
}
```

In our update method (Unity calles this every frame) we first check a boolean to see if the tower should even attempt to shoot. This bool is set to false when the tower fires and then a Coroutine is started that will set the bool back to true after an amount of time controlled by the tower's stats. This means we avoid requesting a target every frame and only when we need it.

We then call the SelectTarget method on the TargetSelector which tell us if there is a valid target.

```csharp
public bool SelectTarget()
{
	if (m_Targets.Count == 0)
		return false;
	CurrentTarget = m_CurrentStrategy();
	return true;
}
```

m_Targets is the list which we previously talked about that enemies register to. If this is empty, we immediately return false as there are simply no targets and then the tower knows it can't fire. If we do have targets then we call m_CurrentStrategy. This is the function that does the leg work for choosing the target. This is a delegate field and the reason for this is that we want to be able to swap what function does the target selection (our third problem) which is easier as a delegate rather than a method call.

m_CurrentStrategy sets the CurrentTarget and then SelectTarget returns true, telling the tower it can fire and that we have a valid target to use. The Fire() method is an abstract method which tower implementation then override to specify their behaviour and they decide how to use the target.

Now we can look at one of our possible strategies, the default one, ClosestTargetToGoal.

```csharp
private Enemy ClosestTargetToGoal()
{
	return m_Targets
		.OrderBy(x => x.GetDistanceFromEnd())
		.FirstOrDefault(x => x.Stats[EnemyStat.Health] > 0);
}
```

LINQ extension methods are the driving force of our target selection. This method wants to find the enemy in the m_Targets collection that is closest to the end of the path. The enemy object provides us with a method that allows us to find this value so we just need to sort the list using the value return by this method which is what is happening on the 4th line. We then take the first enemy that doesn't have a health value below 0.

The health check is neccessary because while enemies are meant to die and deregister themselves when their health drops below 0, we can't be sure that the death happens immediately after the damage is dealt, therefore it is possible that an enemy is set to die that frame but the actual death hasn't occured yet and without this check, a different tower can still choose this enemy to shoot at which would be something we want to avoid.

This gives us the basic functionality of towers getting a target that makes sense. However, there are situations where the tower only choosing the enemy closest to the end goal is not what the player would want. An example of this would a tower that slows enemies. If the tower can hit one of three targets, should it repeatedly hit the same one or should it try to hit each of them once, to make sure all of them are slowed? Either one could be the right answer or at the very least what the player wants to happen. Therefore it makes sense that the strategy for choosing the target should be changeable.

This is where m_CurrentStrategy being a delegate is important. We have an enum of the possible strategies, a method in the TargetSelector that implements a method for each of the possible strategies and then a method which changes the delegate to the method for the strategy we want to use. here are the pieces:

```csharp
public enum Strategy
{
	ClosestToGoal,
	FurthestFromGoal,
	Strongest,
	NotSlowed,
	NotSlowedAndStrongest
}
```

```csharp
public void ChangeStrategy(Strategy strategy)
{
	 m_CurrentStrategy = strategy switch
	 {
		 Strategy.ClosestToGoal => ClosestTargetToGoal,
		 Strategy.FurthestFromGoal => FurthestTargetFromGoal,
		 Strategy.Strongest => StrongestEnemy,
		 Strategy.NotSlowed => NotSlowedAndClosestToEnd,
		 Strategy.NotSlowedAndStrongest => NotSlowedAndStrongest,
		 _ => m_CurrentStrategy
	 };

	 SelectedStrategy = strategy;
}
```

Now, if the user wants the slowing tower to prioritise only targets that aren't already slowed, we can call `ChangeStrategy(NotSlowed)` and now every time `SelectTarget` is called, we get the behaviour we want.

That is pretty much it for our target selection. The three problems we wanted to solve are ticked in this solution. If you are interested in seeing the full code, the classes can be found in the following links:

- [BaseTower](https://github.com/stuart-payne/ProtoTD/blob/master/Assets/Scripts/BaseTower.cs)
- [Enemy](https://github.com/stuart-payne/ProtoTD/blob/master/Assets/Scripts/Enemy.cs)
- [TargetSelector](https://github.com/stuart-payne/ProtoTD/blob/master/Assets/Scripts/TargetSelector.cs)
