![CHRISTMAS TREE](http://cdn01.wallconvert.com/_media/wallpapers_1920x1200/1/2/countryside-landscape-17719.jpg)

So it's a bit late in the day for me to be writing about Christmas, forcing your minds back to times of mince pies, turkeys and many many gifts that you didn't want or ask for.

Ho hum. How can we solve this problem? you might never have asked yourself... Well I have asked it for you, and my answer was "coding and algorithms".

## Where I'm coming from

Not last year but the one previous, Christmas had been reduced to a meer exchange of amazon links from my parents. The magic was lost, the opening of presents uneventful and almost surreal. All parties were well aware of what each present was, who it was from and probably how much it cost.

Fast-forward to November 2017; during which I hatch a plan to remedy this problem, at least for me (selfish, I know).

My solution is simple - the user creates a list of items that they wish for (be it Christmas, a Birthday, perhaps for just being "them") which is stored (unencrypted) on a database, each item with a flag indicating whether someone has bought said item for the user.

The user generates a link and shares it with friends and relatives, declaring "buy me these things - no need to confer with others, the site will handle that". Having shared the link, the user must avoid visiting said link lest they discover which items have already been bought! The link shows the list of not-yet-bought items for others to buy.

And that's it, that's the entire system.

## Why?

Mostly because I fancied making a Redux-backed React app as I hadn't done that before. I wanted to understand Redux and why some prefer it to other frameworks. I've also been discussing with my colleagues over at New Vector whether [Riot.im](https://about.riot.im) should be Redux-based or Flux-based or anything-based so I wanted to follow this route of enquiry.

In the web app, we currently use a few Flux stores, but rather arbitrarily. As such, we commit many sins such as:
 1. Using Flux as a glorified message-passing system between components (some actions are handled by both a Store and a View).
 1. Using Flux Stores as glorified globals for exposing state to multiple components. Many of our Stores exist for this reason!
 1. Managing "state" in React components that is used in the process of rendering but not actually stored in the components state, rather as a member variable.
 1. Using an "asynchronous" dispatcher to work around Flux's restriction on dispatching during a dispatch handler.

With all of these in mind, I set out a few months ago to learn more about Redux, which turned out to be very fruitful: not only did I discover how Redux is used, I also realised that by nature it achieves some of what Flux achieves and more. Not only this, but I gained insight as to how Flux is supposed to be used.

With this newfound insight, I compared the two, realised why each of the above numerated sins are sins and decided that Redux is by nature supperior, simply for the reason that it *prevents* the act of sinning (in some cases).

## A comparison of Flux and Redux

### 1. Using Flux as a glorified message-passing system

#### Why is it bad?
Handling an Action in a component *and* a store is just asking to be misunderstood. Yes, components and stores can handle the same Action but you should really question why before introducing such a complexity.

#### How does Redux mitigate this?
In Redux land, Actions can _only_ be recieved by the Reducers. If you're debugging what happens when an Action is dispatched, you only need to check the Reducers that alter state in response to that particular Action.

### 2. Using Flux Stores as glorified globals for exposing state to multiple components

#### Why is it bad?
You should really be questioning your architecture when an entirely new class of object is needed to allow two views to be rendered based on the same state. This overhead encourages putting shared state in parent components, increasing child-parent coupling and leaking state, violating separation of concerns.

#### How does Redux mitigate this?
Redux has one Store, and yes it is global. Then how is this better? Well, by default all state is global (albeit hopefully namespaced in a sane way - another thing I'd like to do a blog about At Some Point). By having this global state already present, we need only make a new reference to state in order to share the same state accross components.

>Aside: typing whilst on a bus traversing the mountainous roads leading up to Val Thorens (or any place in any mountain range) is *great* touch-type practice. My insentive is to not feel sick, and the process is self-limiting.

Anyway...

### 3. Managing state in React components but not using `this.state`

#### Why is it bad?
The render function of a React component should be based on nothing but its `state` and its `props`. Using anything else is asking for bugs, which normally emerge in the form of out-of-date renderings of components.

```js
const test = 'test';

function hello() {
    console.info('i am a function. you called?');
}
```
#### What does Redux do to mitigate this?
Redux dosn't actually care about React, it -like Flux- is a framework that is entirely separated from the land of React (or at least it can be).

>Okay so the self-limiting is kicking in a bit... I'll soldier on.

A good general rule-of-thumb is to keep all rendered state in `state` and derive that from a Store. A good question to ask when faced with non-`state` state is why can't we put this state in `state`.

The answer might be performance, for instance. It's possible that a bottleneck is found in the app where some part of its stat updates very frequetntly and causes many re-renderings. To mitigate against this, we'd be sorely tempted to not have it in `state` at all - especially if it's not explicitly rendered (i.e. it is used in the process of deciding what to render but nothing "about" it is rendered).

This temptation is evil and performance optimisations should be sought elsewhere.

But anyway, as I said Redux does not give a flying Flux about this.

### 4. Using an "asynchronous" dispatcher and dispatching when handling dispatches.

#### Why is it bad?

Dispatching whilst handling a dispatch is effectively a side-effect. There is no longer the simplicity of "this dispatch will cause a change in state". But rather, "this dispatch will cause another dispatch, which will cause...".

There's no reason to execute a dispatch to occur during a dispatch. None. Zero. Let me explain why...

When handling an Action, a Flux Store is able to modify its own state. But let's say we want to alter its state, do some kind of async work and later alter its state again.

We can't simply alter its state asynchronously - we can only alter state whilst handling a dispatch. So we dispatch with our asynchronous dispatcher. The second dispatch is then handled by a Store and another change in state occurs as a result.

Whilst this might work it's incredibly difficult to follow and maintain. There's no reason to have the asynchronous work done in the store and there are better concepts to use when firing asynchronous dispatches, namely [Asynchronous Actions Creators](https://redux.js.org/docs/advanced/AsyncActions.html#async-action-creators).

#### What does Redux do to mitigate this?

It took me learning how Redux works and why to understand what Flux is trying to achieve by disallowing dispatching whilst handling a dispatch.

The analogy to this in Redux is having side effects whilst computing the new state from the the previous. This is so fundamentally obviously a Bad Thing in Redux, it's painful. Why on Earth would a reducer that takes the previous state to the next based on the action handled do anything other than compute the next state?

## Repenting For My Sins

Having introduced dedicated Flux stores to Riot, I was keen to show its advantages in terms of readabiliy, maintainability etc. whilst unfortunately failing quite badly to understand how or why Flux prevents side-effects. This lead to quite a confusing, difficult to maintain (and quite frankly buggy) Flux store being implemented.

I knew that we had misunderstood Flux, and it took learning about Redux to understand it.

Hopefully, moving forwards we can continue to use Flux with a new appreciation of the rules it enforces. And maybe then we'll be able to easily shift towards Redux in the long run.
