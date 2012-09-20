var util = require('util'),
    events = require('events'),
    file = require('./file.js'),
    path = require('./path.js');
/**
 * Index folder of classes.
 *
 * The second parameter is just an extension to the folder path,
 * but it also tells the type of the loaded class.
 *
 * Example:
 *
 *     mode.class.index('./app', 'controller');
 *     // will search ./app/controller for class files
 *
 * @param {string} folderPath
 * @param {string} namespace
 * @see file.index
 */
exports.index = function(folderPath, scope, namespace) {
  if (namespace) {
    folderPath += '/' + namespace;
  }
  file.index(folderPath, true, function(query, module) {
    module.path = query;
    if (namespace) {
      query = '/' + namespace + query;
    }
    console.log('Loading class: ' + query);
    path.parse(query, scope, module);
  });
};
/**
 * Internal base class.
 *
 * There's another base class with core class functionalities
 * at `lib/class/base.js`. This one is just to get the cycle
 * started and the `mode.class.Base` reference is lost in favor
 * of that class, as soon as it is loaded.
 *
 * @constructor
 * @see class.Base
 */
var Base = exports.Base = function() {
  this.static = Base;
};
Base.children = [];
Base.abstract = true;
/**
 * Extend a class.
 *
 * The biggest difference between most of other existing class
 * models and how _mode_ works is that the class is not defined
 * by an object with a set of properties and methods, but by a
 * function with instructions.
 *
 * This opens a world of possiblities, because being inside of
 * a function, all sorts of inline operations can be performed.
 *
 * By the time this function is called upon, it will have had
 * already inherited everything from the superclass. This makes
 * all parent attributes available from inside the definition
 * function itself.
 *
 * The scope (`this`) inside this function is the prototype of
 * the new class, but the Class function is also referenced by
 * `this.static`. This can obviously be used to define static
 * methods and properties.
 *
 * Basic class example:
 *
 *     var Greeter = mode.class.Base.extend(function() {
 *       this.static.toString = function() {
 *         return 'Hello Earth!';
 *       };
 *       this.toString = function() {
 *         return 'Hello Mars!';
 *       };
 *     });
 *     String(Greeter); // outputs "Hello Earth!"
 *     String(new Greeter()); // outputs "Hello Mars!"
 *
 * The second parameter marks the class as abstract, merely
 * by setting `Class.abstract` to `true`. It is then up to
 * the user to work around it. The _path_ module, for example,
 * will not instantiate abstract controllers and will return
 * a 404 instead.
 *
 * Abstract class example:
 *
 *     var MrAbstract = mode.class.Base.extend(function() {
 *       // do very smart stuff
 *     }, true);
 *
 * Calling a super method is fairly easy, in both instance and
 * static cases. The definition function will be called with
 * the prototype of the parent class as the first parameter.
 *
 * The parent prototype received will also have the `.static`
 * reference, so it can also be used for static super methods.
 *
 * Creating private methods and properties can simply be done
 * by not assigning them to anything. They will continue to
 * exist due to how JavaScript closures work, but there will
 * be no way for them to be referenced from any other class.
 *
 * Inheritance example:
 *
 *     var Child = mode.class.Base.extend(function() {
 *        this.problem = function() {
 *          return cry();
 *        };
 *        var cry = function() {
 *          return ':(';
 *        };
 *     });
 *     var Adult = Child.extend(function(parent) {
 *       this.problem = function(serious) {
 *         if (!serious) {
 *           return solve();
 *         } else {
 *           return parent.problem.call(this);
 *         }
 *       };
 *       var solve = function() {
 *         return ':)';
 *       };
 *     });
 *     var child = new Child();
 *     var adult = new Adult();
 *     child.problem(); // returns ":("
 *     adult.problem(); // returns ":)"
 *     adult.problem(true); // returns ":("
 *
 * @param {function} constructor Class definition
 * @param {boolean} abstract
 * @return {function} Extended class
 * @see #clone
 * @see #propagate
 */
Base.extend = function(definition, abstract) {
  // Allow empty definitions
  if (!definition) {
    definition = function(){};
  }
  var Class = function() {
    // Apply EventEmitter constructor
    events.EventEmitter.call(this);
    // Since all instances of a JavaScript function
    // share its prototype, non-function members need
    // to be cloned and reassigned manually every time
    // a new instance is created
    for (var i in Class.prototype) {
      this[i] = clone(Class.prototype[i]);
    }
    // Call user-defined constructor, if defined
    if (typeof(this.instance) == 'function') {
      this.instance.apply(this, arguments);
    }
  };
  // Copy all of the parent's static properties
  // into the class function directly
  for (var i in this) {
    Class[i] = clone(this[i]);
  }
  Class.children = [];
  Class.abstract = Boolean(abstract);
  // Populate children lists recursively, while
  // storing a static reference to parent class
  propagate(Class, Class.parent = this);
  // Make class a subclass of the EventEmitter
  util.inherits(definition, events.EventEmitter);
  // Copy all of the parent's prototype properties
  // into the prototype of the definition function
  for (var i in this.prototype) {
    definition.prototype[i] = clone(this.prototype[i]);
  }
  definition.prototype.static = Class;
  // Generate class prototype by instanciating the class
  // definition
  // Also send prototype of the parent class as first param
  Class.prototype = new definition(this.prototype);
  return Class;
};
/**
 * Propagate newly created class from parent to parent,
 * and mark it as a child for each of them.
 *
 * This makes the _Class.children_ property possible, which
 * lists all the direct and indirect children of a class.
 *
 * @param {function} Class Newly created class
 * @param {function} parent Parent class
 * @private
 */
var propagate = function(Class, parent) {
  if (parent.parent) {
    propagate(Class, parent.parent);
  }
  parent.children.push(Class);
};
/**
 * Clone object.
 *
 * Deep copy for plain objects, shallow for the rest.
 *
 * @param {*} value Object to be cloned
 * @return {*} Cloned object
 * @private
 */
var clone = function(value) {
  if (!value || typeof(value) != 'object' || value.length) {
    return value;
  }
  var copy = {};
  for (var i in value) {
    copy[i] = clone(value[i]);
  }
  return copy;
};