<b>TakeUntilDestroy</b> is a decorator for Angular that handles unsubscriptions on component destroy. If you have subscriptions that exist
till the component destroy, just define a function or property that returns or is an observable and use this decorator. No triggers, no subscriptions, no 'ngOnDestroy' with just unsubscription purpose.

# ng-rxjs-take-until-destroy
A decorator that automatically unsubscribes observables returned by decorated values on Angular component's 'ngOnDestroy' call.

# Installation
`npm i ng-rxjs-take-until-destroy`

# Usage
```javascript
class SomeClass implements OnInit {
  @TakeUntilDestroy obs$: BehaviorSubject<number> = new BehaviorSubject(5);
  
  constructor(private serviceA: ServiceA,
              private serviceB: ServiceB) {
  }
  
  ngOnInit() {
    this.getStreamA().subscribe();
    this.getStreamB().subscribe();
  }
  
  @TakeUntilDestroy
  private getStreamA(): Observable<StreamAType> {
    return this.serviceA.getStreamA();
  }
  
  @TakeUntilDestroy
  private getStreamB(): Observable<StreamBType> {
    return this.serviceB.getStreamB();
  }
}
```

# What's going on under the hood?
The decorator...
1. Adds once a trigger which is a Subject.
2. Modified decorated function or property calling rxjs' 'takeUntil' function on returned value.
3. Adds 'ngOnDestroy' function to the component or extends already existing.
4. Performs 'next' and 'complete' on earlier added trigger on 'ngOnDestroy' call.

in fact the above component without 'TakeUntilDestroy' decorator would be looking like

```javascript
class SomeClass implements OnInit, OnDestroy {
  obs$: BehaviorSubject<number> = new BehaviorSubject(5);
  private trigger: Subject<any> = new Subject();
  
  constructor(private serviceA: ServiceA,
              private serviceB: ServiceB) {
  }
  
  ngOnInit() {
    this.obs$
      .takeUntil(this.trigger)
      .subscribe();
      
    this.getStreamA()
      .takeUntil(this.trigger)
      .subscribe();
      
    this.getStreamB()
      .takeUntil(this.trigger)
      .subscribe();
  }
  
  ngOnDestroy() {
    this.trigger.next();
    this.trigger.complete();
  }
}
```
# Important
Using Angular CLI with AOT compilation, the ngOnDestroy method has to be implemented directly to component (even if it means to make an empty method). Otherwise ```TakeUntilDestroy``` decorator won't be able to create it and modify itself.

```javascript
class SomeClass implements OnInit {
  constructor(private serviceA: ServiceA,
              private serviceB: ServiceB) {
  }
  
  ngOnInit() {
    this.getStreamA().subscribe();
    this.getStreamB().subscribe();
  }
  
  ngOnDestroy() {}
  
  @TakeUntilDestroy
  private getStreamA(): Observable<StreamAType> {
    return this.serviceA.getStreamA();
  }
}
```
