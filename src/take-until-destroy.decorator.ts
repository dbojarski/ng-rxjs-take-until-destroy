import { isObservable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * A decorator that automatically unsubscribe decorated method on 'ngOnDestroy' function's call.
 * @param {Object} target the class that contains decorated method
 * @param {string} _key a name of decorated function
 * @param {PropertyDescriptor} descriptor a function descriptor that contains access and data attributes
 * @returns {PropertyDescriptor} modified descriptor
 */
export function TakeUntilDestroy(target: Object, _key: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  /**
   * Because 'setNgOnDestroy' function is being called inside returned getter, in case the component
   * doesn't have 'ngOnDestroy' function, the 'ngOnDestroy' must be declared here. Returned getter makes us
   * able only to redefine 'ngOnDestroy', not to declare it.
   */
  if(!target.hasOwnProperty('ngOnDestroy')) {
    target['ngOnDestroy'] = () => {
    };
  }

  /**
   * Sets or extends ngOnDestroy function and conditionally adds a trigger.
   * In case the decorator has been used on a function which return value isn't observable, returns
   * original function and consoles a warning.
   * @returns {Function} a function with observable 'takeUntil' method
   */
  function getter(): Function {
    return (...args) => {
      let value: any = descriptor.value.apply(this, args);

      if(!(isObservable(value))) {
        console.warn(`TakeUntilDestroy decorator has been used on a function which return value isn't instance of Observable.`);

        return value;
      }

      /**
       * Sets ngOnDestroy and adds a subject to the component. This subject will be treated as a trigger that ends subscription.
       * 'this' is being extended from the place the getter has been called.
       * @type {Subject<any>}
       */
      if(!this.tud_onDestroyTrigger) {
        setTrigger.apply(this);
        setNgOnDestroy.apply(this);
      }

      return value.pipe(takeUntil(this.tud_onDestroyTrigger));
    }
  }

  /**
   * In case the ngOnDestroy isn't declared in component, sets it to null.
   * This way it is possible do declare it in getter;
   */
  function setNgOnDestroy() {
    const ngOnDestroy: Function = this.ngOnDestroy;

    this.ngOnDestroy = function(...args) {
      this.tud_onDestroyTrigger.next();
      this.tud_onDestroyTrigger.complete();

      if(ngOnDestroy) {
        ngOnDestroy.apply(this, args);
      }
    };
  }

  /**
   * Sets trigger and makes it private.
   */
  function setTrigger() {
    Object.defineProperty(this, 'tud_onDestroyTrigger', {
      enumerable: false,
      value: new Subject()
    });
  }

  return {
    configurable: true,
    enumerable: true,
    get: getter
  };
}
