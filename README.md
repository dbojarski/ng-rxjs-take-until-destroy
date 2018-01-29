<b>TakeUntilDestroy</b> is a decorator for Angular that handles unsubscriptions on component destroy. If you have subscriptions that exist
till the component destroy, just define a function that returns an observable and use this decorator. No triggers, no subscriptions, no 'ngOnDestroy' with just unsubscription purpose.

# ng-rxjs-take-until-destroy
A decorator that automatically unsubscribes observables returned by decorated methods on Angular component's 'ngOnDestroy' call.

# Installation
`npm i ng-rxjs-take-until-destroy`

# Usage
```javascript
class SomeClass implements OnInit {
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
2. Modified decorated function calling rxjs' 'takeUntil' function on returned value.
3. Adds 'ngOnDestroy' function to the component or extends already existing.
4. Performs 'next' and 'complete' on earlier added trigger on 'ngOnDestroy' call.

in fact the above component without 'TakeUntilDestroy' decorator would be looking like

```javascript
class SomeClass implements OnInit, OnDestroy {
  private trigger: Subject<any> = new Subject();
  
  constructor(private serviceA: ServiceA,
              private serviceB: ServiceB) {
  }
  
  ngOnInit() {
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
