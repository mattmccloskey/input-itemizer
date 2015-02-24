# input-itemizer
An input field which will save multiple values, like tags. Built for use with MooTools

Example: http://dev2.kemso.com/input-itemizer/example/

#### Package Managers
````
// Bower
bower install --save input-itemizer.js
````

How to Use
----------
```javascript
new InputItemizer(element, [object options]);
// Element should be an input with type="text"
 ```
#### Options

Option | Type | Default | Description
------ | ---- | ------- | -----------
seperator | string | ,  | The string to seperate the values
operator | string | : | If you want to save a different value from what is displayed (Like an ID), add the value with this string as the operator. E.g. key:value. The key will be saved, and the value with be displayed.
