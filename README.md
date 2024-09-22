# MathVizJS

This is a program that is used to create live and (somewhat) interactive examples of algorithms that include some math.

It is modular by nature, being able to create modules that provide the visual tools to explain the family of algorithms.

It makes heavy use of d3.js, however every module can use its own logic to create svg elements and the interpolation between the states.



## Sequences

A sequence is something like a scene of something you want to vizualize. Here you
should make the choice of what you want to show and how granular you want to make your
explanation.

### Equations
You can display equations using Latex math syntax. 
You can interpolate between equations.

### Graphics
You can include svg graphics.

## Modules

Modules should provide the tools to vizualize a concrete algorithm of family of algorithms.
It should create the abstraction where the algorithm states are vizualised automatically, 
such that in the sequence you can concentrate on the just altering the state of the algorithm. 

## Transitions
Usually transitions for going from one state to another should be defined. For that matter
there are parameters of _duration_ and _delay_ and occasionally _type_ to define the transition.
These are added automatically to the data, such that they can be defined explicitly if necessary,
without having to clutter up your code with having to define them every time.

