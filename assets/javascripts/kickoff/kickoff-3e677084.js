/*! Kickoff 0.2.4 | https://github.com/oatw/kickoff | MIT license */
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  var Time, mustBeNumber, mustBeValidCount, mustBeValidDay, mustBeValidHours, mustBeValidMinutes, mustBeValidMonth, mustBeValidSeconds, mustBeValidYear, parseArguments;

  parseArguments = function(...date) {
    var d, defaultDate, time;
    defaultDate = [new Date().getFullYear(), 1, 1, 0, 0, 0];
    if (!date[0] || date[0] instanceof Date) {
      date = date[0] ? date[0] : new Date();
      return [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
    }
    if (date[0] instanceof Time) {
      return (function() {
        var j, len, ref, results;
        ref = ['year', 'month', 'day', 'hours', 'minutes', 'seconds'];
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          d = ref[j];
          results.push(date[0][d]);
        }
        return results;
      })();
    }
    if (typeof date[0] === 'string' && date[0].length) {
      [date, time] = date[0].split(/\s+/);
      date = date ? date.split(/-|\//) : [];
      time = time ? time.split(/:/) : [];
      while (date.length < 3) {
        date.push(0);
      }
      while (time.length < 3) {
        time.push(0);
      }
      return date.concat(time).map(function(d, i) {
        return parseInt(d) || defaultDate[i];
      });
    }
    return defaultDate.map(function(d, i) {
      return date[i] || d;
    });
  };

  mustBeValidYear = function(year, silence) {
    if (!(Number.isInteger(year) && year >= 1)) {
      if (silence) {
        return false;
      }
      throw new Error('year must be an integer larger than 1');
    }
    return true;
  };

  mustBeValidMonth = function(month, silence) {
    if (!(Number.isInteger(month) && (1 <= month && month <= 12))) {
      if (silence) {
        return false;
      }
      throw new Error('month must be an integer between 1 to 12');
    }
    return true;
  };

  mustBeValidDay = function(year, month, day, silence) {
    var lastDay;
    lastDay = Time.lastDayOfTheMonth(year, month);
    if (!(Number.isInteger(day) && (1 <= day && day <= lastDay))) {
      if (silence) {
        return false;
      }
      throw new Error(`day must be an integer between 1 to ${lastDay}`);
    }
    return true;
  };

  mustBeValidHours = function(hours, silence) {
    if (!(Number.isInteger(hours) && (0 <= hours && hours <= 23))) {
      if (silence) {
        return false;
      }
      throw new Error('hours must be an integer between 0 and 23');
    }
    return true;
  };

  mustBeValidMinutes = function(minutes, _prefix = 'minutes', silence) {
    if (!(Number.isInteger(minutes) && (0 <= minutes && minutes <= 59))) {
      if (silence) {
        return false;
      }
      throw new Error(`${_prefix} must be an integer between 0 and 59`);
    }
    return true;
  };

  mustBeValidSeconds = function(seconds, silence) {
    return mustBeValidMinutes(seconds, 'seconds', silence);
  };

  mustBeValidCount = function(count, silence) {
    if (!(Number.isInteger(count) && count >= 0)) {
      if (silence) {
        return false;
      }
      throw new Error('count must be a positive integer');
    }
    return true;
  };

  mustBeNumber = function(num, silence) {
    if (typeof num !== 'number') {
      if (silence) {
        return false;
      }
      throw new Error('num must be a number');
    }
    return true;
  };

  Time = class Time {
    constructor(...date) {
      [this.year, this.month, this.day, this.hours, this.minutes, this.seconds] = parseArguments(...date);
      mustBeValidYear(this.year);
      mustBeValidMonth(this.month);
      mustBeValidDay(this.year, this.month, this.day);
      mustBeValidHours(this.hours);
      mustBeValidMinutes(this.minutes);
      mustBeValidSeconds(this.seconds);
    }

  };

  var addPrototypeMethods, i, len, ref, unit;

  Time.prototype.since = function(...date) {
    var current, days, hours, minutes, months, s, seconds, weeks, years;
    s = new Time(...date);
    s = new Date(s.year, s.month - 1, s.day, s.hours, s.minutes, s.seconds);
    current = new Date(this.year, this.month - 1, this.day, this.hours, this.minutes, this.seconds);
    seconds = (current - s) / 1000;
    minutes = seconds / 60;
    hours = minutes / 60;
    days = hours / 24;
    weeks = days / 7;
    months = days / 30;
    years = days / 365;
    return {years, months, days, hours, minutes, seconds, weeks};
  };

  Time.prototype.to = function(...date) {
    return new Time(...date).since(this);
  };

  Time.prototype.calcYear = function(count) {
    mustBeNumber(count);
    return new Time(this.year + count);
  };

  Time.prototype.calcMonth = function(count) {
    mustBeNumber(count);
    return new Time(new Date(this.year, this.month - 1 + count));
  };

  Time.prototype.calcDay = function(count) {
    mustBeNumber(count);
    return new Time(new Date(this.year, this.month - 1, this.day + count));
  };

  Time.prototype.calcHours = function(count) {
    mustBeNumber(count);
    return new Time(new Date(this.year, this.month - 1, this.day, this.hours + count));
  };

  Time.prototype.calcMinutes = function(count) {
    mustBeNumber(count);
    return new Time(new Date(this.year, this.month - 1, this.day, this.hours, this.minutes + count));
  };

  Time.prototype.calcSeconds = function(count) {
    var date;
    mustBeNumber(count);
    date = new Date(this.year, this.month - 1, this.day, this.hours, this.minutes, this.seconds + count);
    return new Time(date);
  };

  Time.prototype.calcWeeks = function(count) {
    var daysCount;
    mustBeNumber(count);
    daysCount = Math.abs(count * 7);
    if (count > 0) {
      return this.nextDay(daysCount);
    } else {
      return this.prevDay(daysCount);
    }
  };

  addPrototypeMethods = function(unit) {
    var s;
    s = ['Hour', 'Minute', 'Second', 'Week'].includes(unit) ? 's' : '';
    Time.prototype[`prev${unit}`] = function(count = 1) {
      mustBeValidCount(count);
      return this[`calc${unit}${s}`](-count);
    };
    return Time.prototype[`next${unit}`] = function(count = 1) {
      mustBeValidCount(count);
      return this[`calc${unit}${s}`](count);
    };
  };

  ref = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second', 'Week'];
  for (i = 0, len = ref.length; i < len; i++) {
    unit = ref[i];
    addPrototypeMethods(unit);
  }

  var bindMethods, dayRuleFn, devideByUnit, hourRuleFn, monthRuleFn, ruleFn, ruleFns, unit$1, yearRuleFn;

  devideByUnit = function(unit, ruleFn, beginning, end) {
    var splited;
    [beginning, end, splited] = [new Time(beginning), new Time(end), []];
    while (ruleFn(beginning, end)) {
      splited.push({
        beginning: beginning[`beginningOfThe${unit}`](),
        end: beginning[`endOfThe${unit}`]()
      });
      beginning = beginning[`next${unit}`]();
    }
    return splited;
  };

  yearRuleFn = function(beginning, end) {
    return new Date(end.year) - new Date(beginning.year) >= 0;
  };

  monthRuleFn = function(beginning, end) {
    return new Date(end.year, end.month - 1) - new Date(beginning.year, beginning.month - 1) >= 0;
  };

  dayRuleFn = function(beginning, end) {
    return new Date(end.year, end.month - 1, end.day) - new Date(beginning.year, beginning.month - 1, beginning.day) >= 0;
  };

  hourRuleFn = function(beginning, end) {
    return new Date(end.year, end.month - 1, end.day, end.hours) - new Date(beginning.year, beginning.month - 1, beginning.day, beginning.hours) >= 0;
  };

  bindMethods = function(unit, ruleFn) {
    return Time[`devideBy${unit}`] = function(beginning, end) {
      return devideByUnit(unit, ruleFn, beginning, end);
    };
  };

  ruleFns = {
    Year: yearRuleFn,
    Month: monthRuleFn,
    Day: dayRuleFn,
    Week: dayRuleFn,
    Hour: hourRuleFn
  };

  for (unit$1 in ruleFns) {
    ruleFn = ruleFns[unit$1];
    bindMethods(unit$1, ruleFn);
  }

  var isLeapYear;

  isLeapYear = function(year) {
    mustBeValidYear(year);
    if (year % 400 === 0) {
      return true;
    }
    return year % 4 === 0 && year % 100 !== 0;
  };

  Time.isLeapYear = function(...date) {
    var year;
    [year] = parseArguments(...date);
    return isLeapYear(year);
  };

  Time.prototype.isLeapYear = function() {
    return Time.isLeapYear(this);
  };

  var lastDayOfTheMonth;

  lastDayOfTheMonth = function(year, month) {
    mustBeValidYear(year);
    mustBeValidMonth(month);
    if ([4, 6, 9, 11].includes(month)) {
      return 30;
    }
    if (month === 2 && isLeapYear(year)) {
      return 29;
    }
    if (month === 2 && !isLeapYear(year)) {
      return 28;
    }
    return 31;
  };

  Time.lastDayOfTheMonth = function(...date) {
    var month, year;
    [year, month] = parseArguments(...date);
    return lastDayOfTheMonth(year, month);
  };

  Time.prototype.lastDayOfTheMonth = function() {
    return Time.lastDayOfTheMonth(this);
  };

  var whatDay;

  whatDay = function(year, month, day) {
    mustBeValidYear(year);
    mustBeValidMonth(month);
    mustBeValidDay(year, month, day);
    return new Date(year, month - 1, day).getDay();
  };

  Time.whatDay = function(...date) {
    var day, month, year;
    [year, month, day] = parseArguments(...date);
    return whatDay(year, month, day);
  };

  Time.prototype.whatDay = function() {
    return Time.whatDay(this);
  };

  Time.prototype.beginningOfTheYear = function() {
    return new Time(this.year, 1, 1, 0, 0, 0);
  };

  Time.prototype.endOfTheYear = function() {
    return new Time(this.year, 12, 31, 23, 59, 59);
  };

  Time.prototype.beginningOfTheMonth = function() {
    return new Time(this.year, this.month, 1, 0, 0, 0);
  };

  Time.prototype.endOfTheMonth = function() {
    return new Time(this.year, this.month, this.lastDayOfTheMonth(), 23, 59, 59);
  };

  Time.prototype.beginningOfTheDay = function() {
    return new Time(this.year, this.month, this.day, 0, 0, 0);
  };

  Time.prototype.endOfTheDay = function() {
    return new Time(this.year, this.month, this.day, 23, 59, 59);
  };

  Time.prototype.beginningOfTheHour = function() {
    return new Time(this.year, this.month, this.day, this.hours, 0, 0);
  };

  Time.prototype.endOfTheHour = function() {
    return new Time(this.year, this.month, this.day, this.hours, 59, 59);
  };

  Time.prototype.beginningOfTheWeek = function() {
    return this.prevDay(this.whatDay()).beginningOfTheDay();
  };

  Time.prototype.endOfTheWeek = function() {
    return this.nextDay(6 - this.whatDay()).endOfTheDay();
  };

  var toStamp;

  toStamp = function(...date) {
    var day, hours, minutes, month, seconds, year;
    [year, month, day, hours, minutes, seconds] = parseArguments(...date);
    mustBeValidYear(year);
    mustBeValidMonth(month);
    mustBeValidDay(year, month, day);
    mustBeValidHours(hours);
    mustBeValidMinutes(minutes);
    mustBeValidSeconds(seconds);
    return new Date(year, month - 1, day, hours, minutes, seconds).getTime() / 1000;
  };

  Time.toStamp = toStamp;

  Time.prototype.toStamp = function() {
    return Time.toStamp(this);
  };

  var earlist, equals, latest;

  equals = function(one, two) {
    [one, two] = [new Time(one), new Time(two)];
    return toStamp(one) === toStamp(two);
  };

  latest = function(...times) {
    if (!times.length) {
      return null;
    }
    times = times.map(function(t) {
      return new Time(t);
    });
    return times.sort(function(a, b) {
      return toStamp(b) - toStamp(a);
    })[0];
  };

  earlist = function(...times) {
    if (!times.length) {
      return null;
    }
    times = times.map(function(t) {
      return new Time(t);
    });
    return times.sort(function(a, b) {
      return toStamp(a) - toStamp(b);
    })[0];
  };

  Time.equals = equals;

  Time.latest = latest;

  Time.earlist = earlist;

  Time.prototype.equals = function(time) {
    return Time.equals(this, new Time(time));
  };

  Time.prototype.laterThan = function(time) {
    return this.toStamp() > new Time(time).toStamp();
  };

  Time.prototype.earlierThan = function(time) {
    return this.toStamp() < new Time(time).toStamp();
  };

  var methodNames;

  methodNames = function(unit = 'day') {
    var s;
    s = ['hour', 'minute', 'second', 'week'].includes(unit) ? 's' : '';
    return {
      nextUnit: luda.camelCase(`next-${unit}`),
      prevUnit: luda.camelCase(`prev-${unit}`),
      beginningOfUnit: luda.camelCase(`beginning-of-the-${unit}`),
      endOfUnit: luda.camelCase(`end-of-the-${unit}`),
      calcUnit: luda.camelCase(`calc-${unit}${s}`),
      devideByUnit: luda.camelCase(`devide-by-${unit}`)
    };
  };

  Time.methodNames = methodNames;

  var double, toString;

  double = function(num) {
    if (num >= 10) {
      return `${num}`;
    } else {
      return `0${num}`;
    }
  };

  toString = function(time, format = '{yyyy}-{mm}-{dd} {HH}:{MM}:{SS}') {
    var dbPattern, loopObj, pattern, placeholder, str, value;
    if (!(Object.prototype.toString.call(time) === "[object Object]" || time instanceof Time)) {
      throw new Error('time must be an object or an instance of Time');
    }
    if (typeof format === 'function') {
      return format(time);
    }
    if ('year' in time) {
      mustBeValidYear(time.year);
    }
    if ('month' in time) {
      mustBeValidMonth(time.month);
    }
    if ('day' in time && 'year' in time && 'month' in time) {
      mustBeValidDay(time.year, time.month, time.day);
    }
    if ('hours' in time) {
      mustBeValidHours(time.hours);
    }
    if ('minutes' in time) {
      mustBeValidMinutes(time.minutes);
    }
    if ('seconds' in time) {
      mustBeValidSeconds(time.seconds);
    }
    str = format.replace(/\{yyyy\}/g, double(time.year));
    loopObj = {
      m: time.month || 1,
      d: time.day || 1,
      H: time.hours || 0,
      M: time.minutes || 0,
      S: time.seconds || 0
    };
    for (placeholder in loopObj) {
      value = loopObj[placeholder];
      pattern = new RegExp(`\\{${placeholder}\\}`, 'g');
      dbPattern = new RegExp(`\\{${placeholder}${placeholder}\\}`, 'g');
      str = str.replace(dbPattern, double(value));
      str = str.replace(pattern, value);
    }
    return str.trim();
  };

  Time.toString = function(time, format) {
    return toString(time, format);
  };

  Time.prototype.toString = function(format) {
    return Time.toString(this, format);
  };

  var weekOfTheYear;

  weekOfTheYear = function(year, month, day) {
    var daysCount, firstDayWeekDay, firstWeekDaysCount, m;
    mustBeValidYear(year);
    mustBeValidMonth(month);
    mustBeValidDay(year, month, day);
    firstDayWeekDay = new Date(year, 0, 1).getDay();
    firstWeekDaysCount = 7 - firstDayWeekDay;
    if (month === 1 && (1 <= day && day <= firstWeekDaysCount)) {
      return 1;
    }
    [m, daysCount] = [0, 0];
    while ((m += 1) < month) {
      daysCount += lastDayOfTheMonth(year, m);
    }
    daysCount += day;
    return 1 + Math.ceil((daysCount - firstWeekDaysCount) / 7);
  };

  Time.weekOfTheYear = function(...date) {
    var day, month, year;
    [year, month, day] = parseArguments(...date);
    return weekOfTheYear(year, month, day);
  };

  Time.prototype.weekOfTheYear = function() {
    return Time.weekOfTheYear(this);
  };

  var isWeekend;

  isWeekend = function(year, month, day) {
    mustBeValidYear(year);
    mustBeValidMonth(month);
    mustBeValidDay(year, month, day);
    return [0, 6].includes(whatDay(year, month, day));
  };

  Time.isWeekend = function(...date) {
    var day, month, year;
    [year, month, day] = parseArguments(...date);
    return isWeekend(year, month, day);
  };

  Time.isWeekday = function(...date) {
    return !Time.isWeekend(...date);
  };

  Time.prototype.isWeekend = function() {
    return Time.isWeekend(this);
  };

  Time.prototype.isWeekday = function() {
    return !Time.isWeekend(this);
  };

  var capitalize;

  capitalize = function(str = '') {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  var Task, builtInProps, depcTypeShortcuts, depcTypes, enhancedProps, find, firstChildWbs, invalidMilestoneActions, isExisted, isRoot, isTask, isValidWbs, joinDeps, joinWbs, milestoneActions, mustBeRoot, mustBeTask, mustBeValidWbs, mustExist, mustHasConsecutiveWbs, mustLikeTask, nextWbs, parent, parentWbs, prevWbs, revokeTask, root, rootTaskActions, splitDeps, splitWbs, taskActions;

  builtInProps = ['uid', 'rootId', 'wbs', 'type', 'created', 'isHidden', 'stacks', 'errors', 'operations', 'readonlys', 'tasks', 'events', 'pendingDeps'];

  enhancedProps = ['dependencies', 'predecessors', 'successors', 'end', 'beginning', 'duration', 'isPicked', 'isFolded', 'actions', 'readonlyProps'];

  taskActions = ['pick', 'update', 'createTask', 'createMilestone', 'destroy', 'fold'];

  rootTaskActions = ['createTask', 'createMilestone', 'destroyDescendants', 'switchState'];

  milestoneActions = ['pick', 'update', 'destroy'];

  invalidMilestoneActions = ['createTask', 'createMilestone', 'fold'];

  depcTypes = ['finishToStart', 'startToStart', 'finishToFinish', 'startToFinish'];

  depcTypeShortcuts = ['f2s', 's2s', 'f2f', 's2f'];

  isTask = function(task) {
    return task instanceof Task;
  };

  mustBeTask = function(task) {
    if (!isTask(task)) {
      throw new Error("Invalid Task instance");
    }
  };

  mustLikeTask = function(data = {}) {
    var error;
    if (isTask(data)) {
      return;
    }
    error = new Error("Invalid Task like data");
    if (!data.data) {
      throw error;
    }
    if (!(data.rootId || data.data.rootId)) {
      throw error;
    }
    if (!(data.uid || data.data.uid)) {
      throw error;
    }
  };

  root = function(task) {
    var rootTask;
    mustLikeTask(task);
    rootTask = Task.roots[task.rootId || task.data.rootId];
    if (!rootTask) {
      throw new Error("Task root not found.");
    }
    return rootTask;
  };

  isRoot = function(task) {
    mustBeTask(task);
    return task === root(task);
  };

  mustBeRoot = function(task) {
    if (!isRoot(task)) {
      throw new Error("Invalid root task");
    }
  };

  isExisted = function(task) {
    var rootId, rootTask;
    mustBeTask(task);
    if (!(rootId = task.rootId)) {
      return false;
    }
    if (!(rootTask = Task.roots[rootId])) {
      return false;
    }
    return isRoot(task) || rootTask.tasks.includes(task);
  };

  mustExist = function(task) {
    mustBeTask(task);
    if (!isExisted(task)) {
      throw new Error("Task doesn't exist");
    }
  };

  find = function(rootTask, uidOrWbs) {
    mustBeRoot(rootTask);
    return rootTask.tasks.find(function(t) {
      if (luda.isString(uidOrWbs)) {
        return t.data.wbs === uidOrWbs.trim();
      }
      return t.uid === uidOrWbs;
    });
  };

  parent = function(task, includeRoot = false) {
    var parentTaskWbs;
    mustExist(task);
    if (isRoot(task)) {
      return null;
    }
    if (!(parentTaskWbs = parentWbs(task.data.wbs))) {
      if (includeRoot) {
        return root(task);
      } else {
        return null;
      }
    }
    return find(root(task), parentTaskWbs);
  };

  mustHasConsecutiveWbs = function(task) {
    var rootTask, wbs;
    mustBeTask(task);
    [wbs, rootTask] = [task.data.wbs, root(task)];
    if (find(rootTask, wbs)) {
      throw new Error(`wbs: ${wbs} has been occupied`);
    }
    if (wbs === '1') {
      return;
    }
    if (find(rootTask, prevWbs(wbs))) {
      return;
    }
    if (find(rootTask, parentWbs(wbs))) {
      return;
    }
    throw new Error(`wbs: ${wbs} is not consecutive`);
  };

  isValidWbs = function(wbs) {
    return wbs && wbs.length;
  };

  mustBeValidWbs = function(wbs) {
    if (!isValidWbs(wbs)) {
      throw new Error(`Invalid wbs: ${wbs}`);
    }
  };

  splitWbs = function(wbs = '') {
    mustBeValidWbs(wbs);
    return (luda.isArray(wbs) ? wbs : wbs.split('.')).map(function(n) {
      var number;
      number = parseInt(n, 10);
      if (!(Number.isInteger(number) && number > 0)) {
        throw new Error(`wbs: ${wbs} must be combined with positive integers`);
      }
      return number;
    });
  };

  joinWbs = function(wbs = []) {
    return splitWbs(wbs).join('.');
  };

  prevWbs = function(wbs = '') {
    var arr;
    if (!isValidWbs(wbs)) {
      return null;
    }
    arr = splitWbs(wbs);
    arr[arr.length - 1] -= 1;
    if (arr[arr.length - 1] <= 0) {
      return null;
    }
    return arr.join('.');
  };

  nextWbs = function(wbs = '') {
    var arr;
    if (!isValidWbs(wbs)) {
      return null;
    }
    arr = splitWbs(wbs);
    arr[arr.length - 1] += 1;
    return arr.join('.');
  };

  parentWbs = function(wbs = '') {
    var arr;
    if (!isValidWbs(wbs)) {
      return null;
    }
    arr = splitWbs(wbs);
    arr.pop();
    if (!arr.length) {
      return null;
    }
    return arr.join('.');
  };

  firstChildWbs = function(wbs = '') {
    var arr;
    if (!isValidWbs(wbs)) {
      return '1';
    }
    arr = splitWbs(wbs);
    arr.push(1);
    return arr.join('.');
  };

  splitDeps = function(deps = '') {
    var arr;
    arr = deps.trim().split(',').map(function(str) {
      return str.trim();
    }).filter(function(str) {
      return str.length;
    });
    return luda.unique(arr).sort();
  };

  joinDeps = function(depsArr = []) {
    var arr;
    arr = depsArr.map(function(str) {
      return str.trim();
    }).filter(function(str) {
      return str.length;
    });
    return luda.unique(arr).sort().join(',');
  };

  revokeTask = function(task) {
    var allTasks, index;
    allTasks = root(task).tasks;
    index = allTasks.indexOf(this);
    if (index >= 0) {
      allTasks.splice(index, 1);
    }
    return delete task.rootId;
  };

  Task = (function() {
    class Task {
      constructor(data = {}, options = {}) {
        var base, base1, base10, base11, base12, base2, base3, base4, base5, base6, base7, base8, base9, beginning, earlistEnd, end, isMilestone, isTopLevel, key, operations, p, readonlys, rollbackIndex, rootId, taskWbs, val;
        if (options.source === 'history') {
          for (key in data) {
            val = data[key];
            this[key] = val;
          }
          return root(this).tasks.push(this);
        }
        if (isTask(data)) {
          throw new Error("Task instance cannot be recreated");
        }
        // Common data structure
        this.uid = luda.guid();
        this.data = Object.assign({}, data);
        delete this.data.uid;
        this.created = false;
        this.errors = {};
        if (!this.data.wbs) {
          this.constructor.roots[this.uid] = this;
          // Root task data structure
          this.rootId = this.uid;
          delete this.data.rootId;
          this.tasks = [];
          this.events = {};
          this.stacks = {
            undo: [],
            redo: []
          };
          (base = this.data).exclusions || (base.exclusions = []);
          if (!('excludeWeekends' in data)) {
            this.data.excludeWeekends = true;
          }
          (base1 = this.data).inclusions || (base1.inclusions = []);
          (base2 = this.data).minDurationSeconds || (base2.minDurationSeconds = 3600 * 24);
          (base3 = this.data).maxHistorySize || (base3.maxHistorySize = 2e308);
          (base4 = this.data).actions || (base4.actions = rootTaskActions.slice());
          this.actions(...this.data.actions);
        } else {
          rootId = this.rootId = this.data.rootId;
          taskWbs = this.data.wbs;
          mustHasConsecutiveWbs(this);
          // Add the task to its root tasks store.
          root(this).tasks.push(this);
          if (!this.trigger('before-create', this.data, true)) {
            return revokeTask(this);
          }
          // Preventing wbs and rootId from being modified
          // in before-create event callback
          this.rootId = rootId;
          delete this.data.rootId;
          this.data.wbs = taskWbs;
          // Setting built-in default values
          isMilestone = this.data.type === 'milestone';
          if (!isMilestone) {
            this.data.type = 'task';
          }
          (base5 = this.data).name || (base5.name = `New ${capitalize(this.data.type)}`);
          if (this.data.end instanceof Time) {
            this.data.end = this.data.end.toString();
          } else {
            (base6 = this.data).end || (base6.end = '');
          }
          if (this.data.beginning instanceof Time) {
            this.data.beginning = this.data.beginning.toString();
          } else {
            (base7 = this.data).beginning || (base7.beginning = '');
          }
          (base8 = this.data).dependencies || (base8.dependencies = {});
          (base9 = this.data.dependencies).finishToStart || (base9.finishToStart = '');
          (base10 = this.data.dependencies).startToStart || (base10.startToStart = '');
          (base11 = this.data.dependencies).finishToFinish || (base11.finishToFinish = '');
          (base12 = this.data.dependencies).startToFinish || (base12.startToFinish = '');
          this.depended = {
            finishToStart: '',
            startToStart: '',
            finishToFinish: '',
            startToFinish: ''
          };
          this.operations = [];
          operations = this.data.actions;
          operations || (operations = isMilestone ? milestoneActions : taskActions);
          this.actions(...operations);
          delete this.data.actions;
          this.readonlys = [];
          readonlys = luda.unique(builtInProps.concat(this.data.readonlyProps || []));
          this.readonlyProps(...readonlys);
          delete this.data.readonlyProps;
          isTopLevel = (p = parent(this, true)) === root(this);
          this.isPicked = isTopLevel ? false : Boolean(p.isPicked);
          this.isFolded = this.isHidden = isTopLevel ? false : Boolean(p.isFolded);
          if (p.data.type === 'milestone') {
            rollbackIndex = root(this).tasks.indexOf(this);
            if (rollbackIndex >= 0) {
              root(this).tasks.splice(rollbackIndex, 1);
            }
            throw new Error("A milestone cannot be a parent");
          }
          if (isMilestone) {
            // Making sure the duration of a milestone is 0.
            // Setting the time of a top level milestone default to current time if
            // without an initial time.
            if (isTopLevel) {
              end = beginning = new Time(this.data.end || this.data.beginning);
              this.data.end = this.data.beginning = end.toString();
            } else {
              // Making sure the duration of a milestone is 0.
              // Setting the time of a non-top level milestone to
              // its parent's end time before creating.
              end = beginning = this.data.end || this.data.beginning;
              this.data.end = this.data.beginning = p.data.end;
            }
          } else {
            // Making sure the duration of a top level task
            // isn't shorter than the min duration setting before creating.
            // If without an initial time range, make it default to current time to
            // current time + minDurationSeconds.
            if (isTopLevel) {
              [end, beginning] = [new Time(this.data.end), new Time(this.data.beginning)];
              earlistEnd = beginning.nextSecond(root(this).data.minDurationSeconds);
              if (end.earlierThan(earlistEnd)) {
                end = earlistEnd;
              }
              this.data.end = end.toString();
              this.data.beginning = beginning.toString();
            } else {
              // Setting the beginning and end of a child
              // the same as its parent before creating.
              [end, beginning] = [this.data.end, this.data.beginning];
              [this.data.end, this.data.beginning] = [p.data.end, p.data.beginning];
            }
          }
          // Setting dependencies
          // and caching the wbs numbers of dependencies not created yet
          Object.keys(this.data.dependencies).forEach((type) => {
            var added, pending, wbs, wbses;
            wbses = splitDeps(this.data.dependencies[type]);
            this._addDeps(type, ...wbses);
            added = splitDeps(this.data.dependencies[type]);
            pending = wbses.filter(function(wbs) {
              return !added.includes(wbs);
            });
            if (pending.length) {
              return this.pendingDeps = (function() {
                var i, len, results;
                results = [];
                for (i = 0, len = pending.length; i < len; i++) {
                  wbs = pending[i];
                  results.push({type, wbs});
                }
                return results;
              })();
            }
          });
          if (!this._tryUpdateSchedule({beginning})) {
            // Adjusting the beginning and end
            return revokeTask(this);
          }
          if (!this._tryUpdateSchedule({end})) {
            return revokeTask(this);
          }
          // Adding this task as a dependency of the ones,
          // which are depended on this but created earlier.
          root(this).tasks.forEach((task) => {
            if (!task.pendingDeps) {
              return;
            }
            task.pendingDeps = task.pendingDeps.filter((p) => {
              if (p.wbs !== this.data.wbs) {
                return true;
              }
              task.addDeps(p.type, this);
              return false;
            });
            if (!task.pendingDeps.length) {
              return delete task.pendingDeps;
            }
          });
        }
        this.created = true;
        this.trigger('after-create');
      }

    }
    Task.roots = {};

    return Task;

  }).call(this);

  Task.prototype.isRoot = function() {
    return isRoot(this);
  };

  var Timeline, mustBeTimeline, mustBeValidLeastRange, mustBeValidPadding;

  mustBeTimeline = function(obj) {
    if (!(obj instanceof Timeline)) {
      throw new Error('Not a timeline instance');
    }
  };

  mustBeValidLeastRange = mustBeValidPadding = function(n) {
    if (!(Number.isInteger(n) && n > 0)) {
      throw new Error('must be a positive integer');
    }
  };

  Timeline = class Timeline {
    constructor(data = {}) {
      if (data instanceof Timeline) {
        throw new Error("Timeline instance cannot be recreated");
      }
      this.uid = luda.guid();
      this.unit(data.unit || 'day');
      this.events = {};
      this._padding = data.padding || 4;
      mustBeValidPadding(this._padding);
      this._leastRange = data.leastRange || 13;
      mustBeValidLeastRange(this._leastRange);
      this._beginning = null;
      this.beginning(new Time(data.beginning));
      this._end = null;
      this.end(data.end ? new Time(data.end) : new Time(data.beginning));
      this._exclusions = data.exclusions || [];
      this._inclusions = data.inclusions || [];
      if ('excludeWeekends' in data) {
        this._excludeWeekends = data.excludeWeekends;
      } else {
        this._excludeWeekends = true;
      }
      this._flags = data.flags || [];
      this.created = true;
      this.trigger('after-create');
    }

  };

  var create, destroy, find$1, relations, stores;

  stores = {};

  create = function(rootTask, timeline, config) {
    mustBeRoot(rootTask);
    mustBeTimeline(timeline);
    return stores[rootTask.uid] = {
      root: rootTask,
      timeline,
      config
    };
  };

  destroy = function(rootId) {
    if (!rootId) {
      throw new Error('rootId must be present');
    }
    rootId = parseInt(rootId, 10);
    return delete stores[rootId];
  };

  find$1 = function(uid) {
    var matched, store;
    if (!uid) {
      throw new Error('uid must be present');
    }
    uid = parseInt(uid, 10);
    matched = null;
    if (store = stores[uid]) {
      return matched = store.root;
    }
    Object.keys(stores).some(function(rootId) {
      store = stores[rootId];
      if (store.timeline.uid === uid) {
        matched = store.timeline;
      }
      if (store.config.uid === uid) {
        matched = store.config;
      }
      if (matched) {
        return true;
      }
      return matched = store.root.find(uid);
    });
    return matched;
  };

  relations = function(uid) {
    var matched, store;
    if (!uid) {
      throw new Error('uid must be present');
    }
    uid = parseInt(uid, 10);
    matched = null;
    if (store = stores[uid]) {
      return matched = store;
    }
    Object.keys(stores).some(function(rootId) {
      store = stores[rootId];
      if (store.timeline.uid === uid) {
        matched = store;
      }
      if (store.config.uid === uid) {
        matched = store;
      }
      if (matched) {
        return true;
      }
      if (store.root.find(uid)) {
        return matched = store;
      }
    });
    return matched;
  };

  var store = {create, destroy, find: find$1, relations};

  luda.mixin('kickoffModelable', {
    model: function() {
      return store.find(this.root.data('uid'));
    },
    relations: function() {
      return store.relations(this.root.data('uid'));
    },
    rootTask: function() {
      var ref;
      return (ref = this.relations()) != null ? ref.root : void 0;
    },
    timeline: function() {
      var ref;
      return (ref = this.relations()) != null ? ref.timeline : void 0;
    },
    config: function() {
      var ref;
      return (ref = this.relations()) != null ? ref.config : void 0;
    }
  });

  var modelable = luda.mixin('kickoffModelable');

  luda.component('kickoffButtonDestroyLink').protect(modelable.all()).protect({
    from: function() {
      return this.root.data('from');
    }
  }).protect({
    destroy: function() {
      if (this.model().isRoot()) {
        return;
      }
      return this.model().removeDeps(this.from());
    }
  }).help({
    create: function() {
      var depc, html, model, shortcut, title, type;
      if (!(model = this.model())) {
        return;
      }
      depc = this.rootTask().find(this.from());
      if (!depc) {
        return;
      }
      ({type, shortcut} = this.model().depcType(depc));
      if (!shortcut) {
        return;
      }
      title = `Remove ${luda.dashCase(type).replace(/-/g, ' ')} association with ${depc.data.wbs} ${depc.data.name}`;
      html = `<i class='kickoff-ico-cross'></i> ${shortcut} ${depc.data.wbs}`;
      return this.root.attr('title', title).html(html);
    },
    listen: function() {
      return [['click', this.destroy]];
    }
  });

  luda.mixin('kickoffLocaleable', {
    locale: function(path = '') {
      var conf, i, key, len, pathes;
      conf = this._locale || (this._locale = this.config().locale);
      pathes = path.split('.');
      for (i = 0, len = pathes.length; i < len; i++) {
        key = pathes[i];
        conf = conf[key];
        if (conf === void 0 || conf === null) {
          return '';
        }
      }
      if (Object.prototype.toString.call(conf) === '[object Object]') {
        conf = conf.$;
      }
      if (conf === void 0 || conf === null) {
        return '';
      }
      return String(conf);
    },
    l: function(path) {
      return this.locale(path);
    }
  });

  var localeable = luda.mixin('kickoffLocaleable');

  luda.component('kickoffButtonCreateMilestone').protect(modelable.all()).protect(localeable.all()).protect({
    create: function() {
      return this.model().create({
        type: 'milestone'
      });
    }
  }).help({
    create: function() {
      var html, model;
      if (!(model = this.model())) {
        return;
      }
      if (this.model().isRoot()) {
        html = this.l('task.actions.createMilestone');
      } else {
        html = "<i class='kickoff-ico-diamond'></i>";
      }
      this.root.html(html);
      if (!this.model().isRoot()) {
        return this.root.attr('title', this.l('task.actions.createSubMilestone'));
      }
    },
    listen: function() {
      return [['click', this.create]];
    }
  });

  luda.component('kickoffButtonsStateSwitch').protect(modelable.all()).protect(localeable.all()).protect({
    template: function() {
      var uid;
      uid = this.model().uid;
      return `<button class='kickoff-button-state-undo' data-uid='${uid}'> ${this.l('header.actions.undo')} </button> <button class='kickoff-button-state-redo' data-uid='${uid}'> ${this.l('header.actions.redo')} </button>`;
    },
    setButtonsStates: function() {
      var canRedo, canUndo;
      canUndo = this.model().stacks.undo.length > 0;
      canRedo = this.model().stacks.redo.length > 0;
      this.undoButton.attr('disabled', canUndo ? null : '');
      return this.redoButton.attr('disabled', canRedo ? null : '');
    },
    undo: function() {
      return this.model().undo();
    },
    redo: function() {
      return this.model().redo();
    }
  }).help({
    create: function() {
      this.root.html(this.template());
      this.setButtonsStates();
      return this.model().on(`after-update-state-stack.${this.id}`, (event, detail) => {
        return this.setButtonsStates();
      });
    },
    listen: function() {
      return [['click', '.kickoff-button-state-undo', this.undo], ['click', '.kickoff-button-state-redo', this.redo]];
    },
    find: function() {
      return {
        undoButton: '.kickoff-button-state-undo',
        redoButton: '.kickoff-button-state-redo'
      };
    },
    destroy: function() {
      return this.model().off(`after-update-state-stack.${this.id}`);
    }
  });

  luda.component('kickoffButtonCreateTask').protect(modelable.all()).protect(localeable.all()).protect({
    create: function() {
      var beginning, end, m, unit;
      if (!this.model().isRoot()) {
        return this.model().create({});
      }
      unit = this.timeline().unit();
      m = Time.methodNames(unit);
      beginning = new Time()[m.beginningOfUnit]();
      end = beginning[m.endOfUnit]();
      return this.model().create({beginning, end});
    }
  }).help({
    create: function() {
      var html, model;
      if (!(model = this.model())) {
        return;
      }
      if (this.model().isRoot()) {
        html = this.l('task.actions.createTask');
      } else {
        html = "<i class='kickoff-ico-copy'></i>";
      }
      this.root.html(html);
      if (!this.model().isRoot()) {
        return this.root.attr('title', this.l('task.actions.createSubTask'));
      }
    },
    listen: function() {
      return [['click', this.create]];
    }
  });

  luda.component('kickoffButtonDestroyTask').protect(modelable.all()).protect(localeable.all()).protect({
    tasksToBeDestroied: function() {
      return this.model().picked().filter(function(t) {
        return t.canBeDestroied();
      });
    },
    destroy: function() {
      var picked;
      if (!this.model().isRoot()) {
        return this.model().destroy();
      }
      if (!(picked = this.tasksToBeDestroied()).length) {
        return;
      }
      return this.model().destroy(...picked);
    },
    enableOrDisableButton: function() {
      if (this.tasksToBeDestroied().length) {
        return this.root.removeAttr('disabled');
      }
      return this.root.attr('disabled', '');
    }
  }).help({
    create: function() {
      var html, title;
      if (!this.model()) {
        return;
      }
      if (this.model().isRoot()) {
        html = this.l('task.actions.destroyDescendants');
      } else {
        html = "<i class='kickoff-ico-delete'></i>";
      }
      this.root.html(html);
      title = this.l(`task.actions.destroy${capitalize(this.model().type())}`);
      if (!this.model().isRoot()) {
        this.root.attr('title', title);
      }
      if (!this.model().isRoot()) {
        return;
      }
      this.enableOrDisableButton();
      this.model().on(`after-create.${this.id}`, () => {
        return this.enableOrDisableButton();
      });
      this.model().on(`after-update.${this.id}`, (event, updated) => {
        if ('isPicked' in updated) {
          return this.enableOrDisableButton();
        }
      });
      return this.model().on(`after-destroy.${this.id}`, () => {
        return setTimeout(() => {
          return this.enableOrDisableButton();
        });
      });
    },
    listen: function() {
      return [['click', this.destroy]];
    }
  });

  luda.component('kickoffButtonEditTask').protect(modelable.all()).protect(localeable.all()).protect({
    edit: function() {
      var closeModal, form, kickoffSelector, modal, r, renderName;
      if (this.model().isRoot()) {
        return;
      }
      modal = luda(`.kickoff-modal-edit-task[data-uid='${this.model().uid}']`);
      if (!modal.length) {
        kickoffSelector = `.kickoff[data-uid='${this.rootTask().uid}']`;
        luda(kickoffSelector).append(modal = this.modalNode());
        form = modal.find('.kickoff-modal-task-form');
        closeModal = function() {
          return luda.kickoffModal(modal).deactivate();
        };
        renderName = `render${capitalize(this.model().type())}Form`;
        if (r = this.config()[renderName]) {
          return r(this.model(), form.get(0), closeModal);
        }
        form.append(this.defaultFormNode());
      }
      return luda.kickoffModal(modal).activate();
    },
    modalNode: function() {
      var detail, newState, node, oldState;
      if (this._modalNode) {
        return this._modalNode;
      }
      node = luda(`<div class='kickoff-modal kickoff-modal-edit-task' data-uid='${this.model().uid}'> <div class='kickoff-modal-body'> <button class='kickoff-button-close-modal'> <i class='kickoff-ico-cross'></i> </button> <div class='kickoff-modal-task-form'></div> </div> </div>`);
      node.toggleClass('is-milestone', this.model().isMilestone());
      detail = {
        $form: node.find('.kickoff-modal-task-form').get(0)
      };
      [oldState, newState] = [null, null];
      node.on(`after-activate.${this.id}`, () => {
        clearTimeout(this._isActivatingForm);
        clearTimeout(this._isDeactivatingForm);
        return this._isActivatingForm = setTimeout(() => {
          oldState = this.model().pushUndoState();
          this.model().stopTrackingHistory();
          return this.model().trigger('after-activate-form', detail);
        });
      });
      node.on(`after-deactivate.${this.id}`, () => {
        clearTimeout(this._isActivatingForm);
        clearTimeout(this._isDeactivatingForm);
        return this._isDeactivatingForm = setTimeout(() => {
          this.model().trigger('after-deactivate-form', detail);
          this.model().startTrackingHistory();
          newState = this.model().pushUndoState();
          if (newState) {
            return this.model().popUndoState();
          }
          if (oldState) {
            return this.model().popUndoState();
          }
        });
      });
      return this._modalNode = node;
    },
    defaultFormNode: function() {
      var node;
      if (this._defaultFormNode) {
        return this._defaultFormNode;
      }
      node = luda(`<div class='kickoff-form' data-uid='${this.model().uid}'></div>`);
      return this._defaultFormNode = node;
    }
  }).help({
    create: function() {
      var html;
      if (!this.model()) {
        return;
      }
      html = "<i class='kickoff-ico-edit'></i>";
      this.root.html(html);
      this.root.attr('title', this.l(`task.actions.update${capitalize(this.model().type())}`));
      return this.model().on(`after-destroy.${this.id}`, (e) => {
        clearTimeout(this._isActivatingForm);
        clearTimeout(this._isDeactivatingForm);
        return this.modalNode().remove();
      });
    },
    listen: function() {
      return [['click', this.edit]];
    }
  });

  luda.component('kickoffButtonFoldTask').protect(modelable.all()).protect(localeable.all()).protect({
    render: function() {
      var html, title;
      if (this.model().isFolded) {
        title = this.l('task.actions.unfold');
        html = "<i class='kickoff-ico-right'></i>";
        this.root.addClass('is-folded');
      } else {
        title = this.l('task.actions.fold');
        html = "<i class='kickoff-ico-down'></i>";
        this.root.removeClass('is-folded');
      }
      return this.root.toggleClass('is-hidden', this.model().children().length === 0).attr('title', title).html(html);
    }
  }).protect({
    toggle: function() {
      return this.model().fold(!this.model().isFolded);
    }
  }).help({
    create: function() {
      var model;
      if (!(model = this.model())) {
        return;
      }
      this.render();
      model.on(`after-create.${this.id}`, (event) => {
        if (event.target === model) {
          return;
        }
        return this.render();
      });
      model.on(`after-destroy.${this.id}`, (event) => {
        if (event.target === model) {
          return;
        }
        return this.render();
      });
      return model.on(`after-update.${this.id}`, (event, updated) => {
        if (event.target !== model) {
          return;
        }
        if ('isFolded' in updated) {
          return this.render();
        }
      });
    },
    destroy: function() {
      var ref, ref1;
      clearTimeout(this._isRendering);
      if ((ref = this.model()) != null) {
        ref.off(`after-create.${this.id}`);
      }
      return (ref1 = this.model()) != null ? ref1.off(`after-update.${this.id}`) : void 0;
    },
    listen: function() {
      return [['click', this.toggle]];
    }
  });

  luda.component('kickoffButtonPickTask').protect(modelable.all()).protect(localeable.all()).protect({
    render: function() {
      var html, title;
      if (this.model().isPicked) {
        title = this.l('task.actions.unpick');
        html = "<i class='kickoff-ico-minus'></i>";
        this.root.addClass('is-picked');
      } else {
        title = this.l('task.actions.pick');
        html = "<i class='kickoff-ico-plus'></i>";
        this.root.removeClass('is-picked');
      }
      return this.root.attr('title', title).html(html);
    }
  }).protect({
    toggle: function() {
      return this.model().pick(!this.model().isPicked);
    }
  }).help({
    create: function() {
      var model;
      if (!(model = this.model())) {
        return;
      }
      this.render();
      return this.model().on(`after-update.${this.id}`, (event, updated) => {
        if (event.target !== this.model()) {
          return;
        }
        if ('isPicked' in updated) {
          return this.render();
        }
      });
    },
    destroy: function() {
      var ref;
      return (ref = this.model()) != null ? ref.off(`after-update.${this.id}`) : void 0;
    },
    listen: function() {
      return [['click', this.toggle]];
    }
  });

  luda.component('kickoffButtonsViewSwitch').protect(modelable.all()).protect(localeable.all()).include({
    view: function(type = 'gantt') {
      luda(`.kickoff[data-uid='${this.rootTask().uid}']`).toggleClass('view-switch-to-table', type === 'table');
      return this.setButtonsStates(type);
    }
  }).protect({
    template: function() {
      return `<button class='kickoff-button-view-gantt'> ${this.l('header.navigations.chartView')} </button> <button class='kickoff-button-view-table'> ${this.l('header.navigations.tableView')} </button>`;
    },
    setGanttView: function() {
      return this.view('gantt');
    },
    setTableView: function() {
      return this.view('table');
    },
    setButtonsStates: function(viewType) {
      if (viewType === 'gantt') {
        this.viewGanttButton.attr('disabled', '');
        return this.viewTableButton.removeAttr('disabled');
      } else {
        this.viewGanttButton.removeAttr('disabled');
        return this.viewTableButton.attr('disabled', '');
      }
    }
  }).help({
    create: function() {
      this.root.html(this.template());
      return this.view('gantt');
    },
    listen: function() {
      return [['click', '.kickoff-button-view-gantt', this.setGanttView], ['click', '.kickoff-button-view-table', this.setTableView]];
    },
    find: function() {
      return {
        viewGanttButton: '.kickoff-button-view-gantt',
        viewTableButton: '.kickoff-button-view-table'
      };
    }
  });

  luda.component('kickoffButtonsUnitZoom').protect(modelable.all()).protect(localeable.all()).protect({
    template: function() {
      return `<button class='kickoff-button-unit-zoom-in'> ${this.l('header.navigations.zoomIn')} </button> <span class='kickoff-buttons-unit-zoom-current'></span> <button class='kickoff-button-unit-zoom-out'> ${this.l('header.navigations.zoomOut')} </button>`;
    }
  }).protect({
    unitState: function() {
      var all, current, index, zoomInAble, zoomOutAble;
      current = this.timeline().unit();
      all = this.timeline().avaliableUnits();
      index = all.indexOf(current);
      zoomInAble = index !== 0;
      zoomOutAble = index !== all.length - 1;
      return {current, all, index, zoomInAble, zoomOutAble};
    },
    zoomIn: function() {
      var all, index, zoomInAble;
      this.ensureGanttView();
      ({zoomInAble, index, all} = this.unitState());
      if (zoomInAble) {
        return this.timeline().unit(all[index - 1]);
      }
    },
    zoomOut: function() {
      var all, index, zoomOutAble;
      this.ensureGanttView();
      ({zoomOutAble, index, all} = this.unitState());
      if (zoomOutAble) {
        return this.timeline().unit(all[index + 1]);
      }
    },
    setButtonsStates: function() {
      var zoomInAble, zoomOutAble;
      ({zoomInAble, zoomOutAble} = this.unitState());
      this.zoomInButton.attr('disabled', zoomInAble ? null : '');
      return this.zoomOutButton.attr('disabled', zoomOutAble ? null : '');
    },
    setCurrentUnitText: function() {
      var unit;
      unit = this.timeline().unit();
      return this.unitText.text(this.l(`header.navigations.zoomUnits.${unit}`) || unit);
    },
    ensureGanttView: function() {
      var selector, switcher;
      selector = `.kickoff-buttons-view-switch[data-uid='${this.rootTask().uid}']`;
      switcher = luda(selector);
      if (!switcher.length) {
        return;
      }
      return luda.kickoffButtonsViewSwitch(switcher).view('gantt');
    }
  }).help({
    create: function() {
      this.root.html(this.template());
      this.setCurrentUnitText();
      return this.timeline().on(`after-update.${this.id}`, (event) => {
        this.setCurrentUnitText();
        return this.setButtonsStates();
      });
    },
    destroy: function() {
      var ref;
      return (ref = this.timeline()) != null ? ref.off(`after-update.${this.id}`) : void 0;
    },
    listen: function() {
      return [['click', '.kickoff-button-unit-zoom-in', this.zoomIn], ['click', '.kickoff-button-unit-zoom-out', this.zoomOut]];
    },
    find: function() {
      return {
        zoomInButton: '.kickoff-button-unit-zoom-in',
        zoomOutButton: '.kickoff-button-unit-zoom-out',
        unitText: '.kickoff-buttons-unit-zoom-current'
      };
    }
  });

  luda.component('kickoffForm').protect(modelable.all()).protect(localeable.all()).protect({
    fieldType: function(type) {
      if (type === 'number' || type === 'select' || type === 'textarea' || type === 'time') {
        return type;
      }
      return 'text';
    }
  }).protect({
    render: function() {
      var formFields;
      formFields = this.config().formFields;
      this.root.html(this.fieldTemplate(formFields));
      return this.executeCustomRenderers(formFields);
    },
    fieldTemplate: function(fields = [], parentIndex) {
      var model;
      model = this.model();
      return fields.map((field, index) => {
        var fieldIndex, label, multiple, prop, render, type;
        ({prop, type, render, multiple} = field);
        if ('label' in field) {
          label = field.label;
        } else {
          label = this.l(`task.props.${prop}`) || capitalize(prop);
        }
        fieldIndex = parentIndex != null ? `${parentIndex}-${index}` : index;
        if (field.fields) {
          if (render) {
            return `<div class='kickoff-form-custom-field-group' data-uid='${model.uid}' data-label='${label}' data-field-index='${fieldIndex}'></div>`;
          }
          return `<div class='kickoff-form-field-group' data-uid='${model.uid}' data-field-index='${fieldIndex}'> <label class='kickoff-form-field-group-label'> ${label} </label> <div class='kickoff-form-field-group-fields'> ${this.fieldTemplate(field.fields, fieldIndex)} </div> </div>`;
        }
        if (!prop) {
          return '';
        }
        if (render) {
          return `<div class='kickoff-form-custom-field' data-uid='${model.uid}' data-prop='${prop}' data-field-index='${fieldIndex}'></div>`;
        }
        return `<div class='kickoff-form-${this.fieldType(type)}' data-uid='${model.uid}' data-prop='${prop}' data-field-index='${fieldIndex}'></div>`;
      }).join('');
    }
  }).protect({
    executeCustomRenderers: function(fields = [], parentIndex) {
      var model;
      model = this.model();
      return fields.forEach((field, index) => {
        var fieldIndex, prop, render, selector;
        ({prop, render} = field);
        if (render) {
          fieldIndex = parentIndex != null ? `${parentIndex}-${index}` : index;
          if (field.fields) {
            selector = ".kickoff-form-custom-field-group";
            selector += `[data-field-index='${fieldIndex}']`;
          }
          if (prop) {
            selector = ".kickoff-form-custom-field";
            selector += `[data-field-index='${fieldIndex}']`;
          }
          if (!selector) {
            return;
          }
          return render.call(model, model, this.root.find(selector).get(0));
        } else {
          if (field.fields) {
            return this.executeCustomRenderers(field.fields, index);
          }
        }
      });
    }
  }).help({
    create: function() {
      return this.render();
    }
  });

  luda.mixin('kickoffInputable', {
    inputCls: 'kickoff-form-input',
    errorMarkerCls: 'kickoff-form-input',
    render: function() {
      return this.root.html(this.template());
    },
    // @reset()
    template: function() {
      var bottomLevelProp, label, prop;
      ({bottomLevelProp, prop} = this.fieldConfig);
      if ('label' in this.fieldConfig) {
        label = this.fieldConfig.label;
      } else {
        label = this.l(`task.props.${prop}`) || capitalize(bottomLevelProp);
      }
      return `<label class='kickoff-form-label'>${label}</label> ${this.inputTemplate()} <p class='kickoff-form-error is-hidden'></p>`;
    },
    inputTemplate: function() {
      var placeholder;
      placeholder = this.fieldConfig.placeholder || '';
      return `<input class='${this.inputCls}' type='text' placeholder='${placeholder}' data-auto='false'/>`;
    },
    getInputValue: function() {
      return String(this.input.val()).trim();
    },
    setInputValue: function() {
      return this.input.val(this.getModelValue());
    },
    toggleInputReadonly: function() {
      var prop, topLevelProp;
      ({prop, topLevelProp} = this.fieldConfig);
      if (this.model().readonly(topLevelProp) || this.model().readonly(prop)) {
        this.input.attr('readonly', '');
        return this.setInputValue();
      } else {
        return this.input.removeAttr('readonly');
      }
    },
    toggleFieldError: function(force) {
      var propError;
      if (force === null) {
        return this.model().error(this.fieldConfig.prop, null);
      }
      propError = this.model().error(this.fieldConfig.prop);
      if (propError) {
        this.error.removeClass('is-hidden').html(propError.join('</br>'));
        return this.errorMarker.addClass('is-invalid');
      } else {
        this.error.addClass('is-hidden').html('');
        return this.errorMarker.removeClass('is-invalid');
      }
    },
    reset: function() {
      this.setInputValue();
      this.toggleInputReadonly();
      return this.toggleFieldError(null);
    },
    getModelValue: function() {
      var i, len, p, propTree, ref, topLevelProp, value;
      ({propTree, topLevelProp} = this.fieldConfig);
      if (topLevelProp === 'successors') {
        value = this.model().depended;
      } else if (topLevelProp === 'predecessors' || topLevelProp === 'dependencies') {
        value = this.model().data.dependencies;
      } else {
        value = this.model().data[topLevelProp];
      }
      ref = propTree.slice(1);
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (!(value = value[p])) {
          return;
        }
      }
      return value;
    },
    updateModelValue: function() {
      var data;
      this.toggleFieldError(null);
      data = {};
      data[this.fieldConfig.prop] = this.getInputValue();
      return this.model().update(data);
    },
    deferUpdateModelValue: function() {
      clearTimeout(this._isUpdating);
      return this._isUpdating = setTimeout((() => {
        return this.updateModelValue();
      }), 50);
    },
    afterUpdate: function(event, updated) {
      var newVal, oldVal, prop, topLevelProp;
      if (event.target !== this.model()) {
        return;
      }
      ({topLevelProp, prop} = this.fieldConfig);
      if (updated[topLevelProp] || updated[prop]) {
        this.setInputValue();
      }
      if (updated.error) {
        ({newVal, oldVal} = updated.error);
        if (newVal[topLevelProp] || oldVal[topLevelProp] || newVal[prop] || oldVal[prop]) {
          this.toggleFieldError();
        }
      }
      if (updated.readonlyProps) {
        ({newVal, oldVal} = updated.readonlyProps);
        if (newVal.includes(topLevelProp) || oldVal.includes(topLevelProp) || newVal.includes(prop) || oldVal.includes(prop)) {
          return this.toggleInputReadonly();
        }
      }
    },
    creator: function() {
      var bottomLevelProp, conf, fieldIndexes, index, propTree, topLevelProp;
      fieldIndexes = String(this.root.data('field-index')).split('-');
      conf = {
        fields: this.config().formFields
      };
      while ((index = fieldIndexes.shift()) >= 0) {
        conf = conf.fields[index];
      }
      propTree = conf.prop.split('.');
      topLevelProp = propTree[0];
      bottomLevelProp = propTree[propTree.length - 1];
      this.fieldConfig = Object.assign({propTree, topLevelProp, bottomLevelProp}, conf);
      this.render();
      this.model().on(`after-activate-form.${this.id}`, (e) => {
        if (e.target !== this.model()) {
          return;
        }
        return this.reset(e);
      });
      this.model().on(`after-deactivate-form.${this.id}`, (e) => {
        if (e.target !== this.model()) {
          return;
        }
        return this.reset(e);
      });
      return this.model().on(`after-update.${this.id}`, (e, u) => {
        if (e.target !== this.model()) {
          return;
        }
        return this.afterUpdate(e, u);
      });
    },
    destroyer: function() {
      var ref, ref1, ref2;
      clearTimeout(this._isUpdating);
      if ((ref = this.model()) != null) {
        ref.off(`after-activate-form.${this.id}`);
      }
      if ((ref1 = this.model()) != null) {
        ref1.off(`after-deactivate-form.${this.id}`);
      }
      return (ref2 = this.model()) != null ? ref2.off(`after-update.${this.id}`) : void 0;
    },
    listener: function() {
      return [['change', `.${this.inputCls}`, this.updateModelValue], ['keydown keyup', `.${this.inputCls}`, this.deferUpdateModelValue]];
    },
    finder: function() {
      return {
        input: `.${this.inputCls}`,
        error: '.kickoff-form-error',
        errorMarker: `.${this.errorMarkerCls}`
      };
    }
  });

  var inputable = luda.mixin('kickoffInputable');

  luda.component('kickoffFormNumber').protect(modelable.all()).protect(localeable.all()).protect(inputable.except('inputCls', 'errorMarkerCls', 'inputTemplate', 'getInputValue')).protect({
    inputCls: 'kickoff-form-number-input',
    errorMarkerCls: 'kickoff-form-number-input',
    inputTemplate: function() {
      var placeholder;
      placeholder = this.fieldConfig.placeholder || '';
      return `<input class='${this.inputCls}' type='number' placeholder='${placeholder}' data-auto='false' />`;
    },
    getInputValue: function() {
      var value;
      value = this.input.val();
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string' && !value.trim().length) {
        return 0/0;
      }
      return Number(value);
    }
  }).help({
    create: function() {
      return this.creator();
    },
    destroy: function() {
      return this.destroyer();
    },
    listen: function() {
      return this.listener();
    },
    find: function() {
      return this.finder();
    }
  });

  var asc, compareWbs, desc, order;

  compareWbs = function(a = '', b = '') {
    var aWbs, bWbs, result;
    if (!a) {
      return -1;
    }
    if (!b) {
      return 1;
    }
    [aWbs, bWbs, result] = [splitWbs(a), splitWbs(b), 0];
    if (aWbs.length < bWbs.length) {
      aWbs.push(0);
    }
    aWbs.some(function(n, i) {
      return result = n - (bWbs[i] || 0);
    });
    return result;
  };

  asc = function(...tasks) {
    tasks.forEach(function(t) {
      return mustBeTask(t);
    });
    return tasks.sort(function(a, b) {
      var ref, ref1;
      return compareWbs((ref = a.data) != null ? ref.wbs : void 0, (ref1 = b.data) != null ? ref1.wbs : void 0);
    });
  };

  desc = function(...tasks) {
    return asc(...tasks).reverse();
  };

  order = function(order = 'asc', ...tasks) {
    if (order === 'asc') {
      return asc(...tasks);
    }
    if (order === 'desc') {
      return desc(...tasks);
    }
    throw new Error("order can only be 'asc' or 'desc'");
  };

  Task.asc = asc;

  Task.desc = desc;

  Task.order = order;

  var indexOf = [].indexOf;

  luda.component('kickoffFormSelect').protect(modelable.all()).protect(localeable.all()).protect(inputable.except('inputCls', 'errorMarkerCls', 'inputTemplate', 'getInputValue', 'setInputValue', 'toggleInputReadonly')).include({
    showOptions: function() {
      return this.options.removeClass('is-hidden');
    },
    hideOptions: function() {
      return this.options.addClass('is-hidden');
    },
    toggleOptions: function(hide) {
      return this.options.toggleClass('is-hidden', hide);
    }
  }).protect({
    inputCls: 'kickoff-form-select-input',
    errorMarkerCls: 'kickoff-form-select-selected-labels',
    inputTemplate: function() {
      var placeholder;
      placeholder = this.fieldConfig.placeholder || '';
      return `<div class='kickoff-form-select-simulated'> <input class='kickoff-form-select-selected-labels' readonly placeholder='${placeholder}' data-auto='false' /> <div class='kickoff-form-select-options is-hidden'></div> </div>`;
    },
    optionsTemplate: function(options = []) {
      var bottomLevelProp, inputType, label, model, multiple, prop, topLevelProp;
      model = this.model();
      ({topLevelProp, prop, bottomLevelProp, label, multiple} = this.fieldConfig);
      inputType = multiple ? 'checkbox' : 'radio';
      if ((topLevelProp === 'predecessors' || topLevelProp === 'successors') && !options.length) {
        asc(...model.root().tasks).map(function(t) {
          if (topLevelProp === 'predecessors') {
            if (!(model.predecessors(bottomLevelProp).includes(t) || t.isValidPredecessorOf(model))) {
              return;
            }
          }
          if (topLevelProp === 'successors') {
            if (!(model.successors(bottomLevelProp).includes(t) || t.isValidSuccessorOf(model))) {
              return;
            }
          }
          return options.push({
            value: t.data.wbs,
            label: `${t.data.wbs} ${t.data.name}`
          });
        });
      }
      return options.map((option) => {
        var str, type, value;
        ({label, value} = option);
        ({type, str} = this.valueToStr(value));
        return `<label class='kickoff-form-select-option' data-auto='false'> <input class='kickoff-form-select-input' name='kickoff_task_${model.uid}_${prop}' type='${inputType}' value='${value}' data-auto='false' data-prop='${prop}' data-value-type='${type}' data-label='${label}' /> ${label} </label>`;
      }).join('');
    },
    refreshOptions: function() {
      var options, self, useOptions;
      self = this;
      ({options} = this.fieldConfig);
      this.hideOptions();
      if (luda.isFunction(options)) {
        useOptions = function(deferOptions) {
          return self.options.html(self.optionsTemplate(deferOptions));
        };
        return options(useOptions);
      }
      return this.options.html(this.optionsTemplate(options));
    },
    toggleInputReadonly: function() {
      var model, prop, propIsReadonly, rootTask, topLevelProp;
      ({prop, topLevelProp} = this.fieldConfig);
      model = this.model();
      rootTask = model.root();
      propIsReadonly = model.readonly(topLevelProp) || model.readonly(prop);
      this.setInputValue();
      this.simulatedInput.toggleClass('is-readonly', propIsReadonly);
      return this.input.each(function(item) {
        var isReadonly, reverseP, reverseTask, val;
        isReadonly = propIsReadonly;
        if (topLevelProp === 'predecessors' || topLevelProp === 'successors') {
          reverseP = {
            predecessors: 'successors',
            successors: 'predecessors'
          };
          reverseTask = rootTask.find(item.value);
          isReadonly || (isReadonly = reverseTask.readonly(reverseP[topLevelProp]));
          isReadonly || (isReadonly = reverseTask.readonly(prop.replace(topLevelProp, reverseP[topLevelProp])));
        }
        val = isReadonly ? '' : null;
        luda(item).attr('disabled', val);
        luda(item).parent('.kickoff-form-select-option').attr('readonly', val);
        return void 0;
      });
    },
    getInputValue: function() {
      var multiple, topLevelProp, vals;
      ({multiple, topLevelProp} = this.fieldConfig);
      vals = [];
      this.input.each((item) => {
        if (!item.checked) {
          return;
        }
        vals.push(this.strToValue(item.value, luda(item).data('value-type')));
        return void 0;
      });
      if (multiple) {
        return vals;
      }
      if (topLevelProp === 'predecessors' || topLevelProp === 'successors') {
        return vals[0] || '';
      }
      return vals[0];
    },
    setInputValue: function() {
      var multiple, topLevelProp, vals;
      ({multiple, topLevelProp} = this.fieldConfig);
      vals = this.getModelValue();
      if (multiple && typeof vals === 'string') {
        vals = splitDeps(vals);
      }
      if (!luda.isArray(vals)) {
        vals = [vals];
      }
      this.input.each((item) => {
        var checked, ref;
        checked = (ref = this.strToValue(item.value, luda(item).data('value-type')), indexOf.call(vals, ref) >= 0);
        luda(item).attr('checked', checked ? '' : null);
        item.checked = Boolean(checked);
        return void 0;
      });
      return this.setSimulatedInputValue();
    },
    setSimulatedInputValue: function() {
      var checkedLabels;
      checkedLabels = [];
      this.input.each(function(item) {
        if (!item.checked) {
          return;
        }
        checkedLabels.push(luda(item).data('label'));
        return void 0;
      });
      return this.simulatedInput.val(checkedLabels.join(', '));
    },
    toggleOptionsHandler: function(event) {
      var prop, topLevelProp;
      ({prop, topLevelProp} = this.fieldConfig);
      if (this.model().readonly(topLevelProp) || this.model().readonly(prop)) {
        return;
      }
      if (event.type === 'focusin') {
        return this.showOptions();
      } else if (event.type === 'change') {
        return this.toggleOptions(!this.fieldConfig.multiple);
      }
    },
    toggleOptionsBySimulatedInputHandler: function(event) {
      var isHidden, prop, topLevelProp;
      ({prop, topLevelProp} = this.fieldConfig);
      if (this.model().readonly(topLevelProp) || this.model().readonly(prop)) {
        return;
      }
      if (event.type === 'focusin') {
        isHidden = this.options.hasClass('is-hidden');
        this.showOptions();
        return this._handledByFocusin = isHidden;
      } else if (event.type === 'click') {
        if (!this._handledByFocusin) {
          this.toggleOptions();
        }
        return delete this._handledByFocusin;
      }
    }
  }).protect({
    valueToStr: function(value) {
      var str, type;
      type = Object.prototype.toString.call(value);
      if (['[object String]', '[object Boolean]', '[object Number]'].includes(type)) {
        str = String(value);
      } else if (value === void 0 || value === null) {
        str = '';
      } else {
        str = JSON.stringify(type);
      }
      return {type, str};
    },
    strToValue: function(str, type) {
      if (type === '[object String]') {
        return str;
      }
      if (type === '[object Number]') {
        return Number(str);
      }
      if (type === '[object Boolean]') {
        return Boolean(str);
      }
      if (type === '[object Undefined]') {
        return void 0;
      }
      if (type === '[object Null]') {
        return null;
      }
      return JSON.parse(str);
    }
  }).help({
    create: function() {
      this.creator();
      this.model().on(`after-activate-form.${this.id}`, (event) => {
        if (event.target !== this.model()) {
          return;
        }
        return this.refreshOptions();
      });
      return this.model().on(`after-update.${this.id}`, (event, updated) => {
        var isAffected, prop, topLevelProp;
        if (event.target !== this.model()) {
          return;
        }
        ({topLevelProp, prop} = this.fieldConfig);
        if (topLevelProp !== 'predecessors' && topLevelProp !== 'successors') {
          return;
        }
        isAffected = false;
        if (updated.predecessors) {
          isAffected = Object.keys(updated.predecessors.newVal).some(function(type) {
            var newVals, oldVals;
            if (prop === `predecessors.${type}`) {
              return;
            }
            newVals = splitDeps(updated.predecessors.newVal[type]);
            oldVals = splitDeps(updated.predecessors.oldVal[type]);
            return !luda.arrayEqual(newVals, oldVals);
          });
        }
        if (updated.successors) {
          isAffected || (isAffected = Object.keys(updated.successors.newVal).some(function(type) {
            var newVals, oldVals;
            if (prop === `successors.${type}`) {
              return;
            }
            newVals = splitDeps(updated.successors.newVal[type]);
            oldVals = splitDeps(updated.successors.oldVal[type]);
            return !luda.arrayEqual(newVals, oldVals);
          }));
        }
        if (isAffected) {
          return this.refreshOptions();
        }
      });
    },
    destroy: function() {
      return this.destroyer();
    },
    listen: function() {
      return [
        ['change',
        '.kickoff-form-select-input',
        this.setSimulatedInputValue],
        ['focusin change',
        '.kickoff-form-select-input',
        this.toggleOptionsHandler],
        ['focusin click',
        '.kickoff-form-select-selected-labels',
        this.toggleOptionsBySimulatedInputHandler],
        [
          'focusin click',
          function(e) {
            var focusedSelect,
          targets;
            focusedSelect = null;
            e.eventPath().some(function(element) {
              if (luda(element).is('.kickoff-form-select')) {
                focusedSelect = element;
                return true;
              }
            });
            targets = luda('.kickoff-form-select').not(focusedSelect);
            return luda.kickoffFormSelect(targets).hideOptions();
          }
        ]
      ].concat(this.listener());
    },
    watch: function() {
      return {
        node: [['.kickoff-form-select-input', this.reset]]
      };
    },
    find: function() {
      return Object.assign(this.finder(), {
        simulatedInput: '.kickoff-form-select-selected-labels',
        options: '.kickoff-form-select-options'
      });
    }
  });

  luda.component('kickoffFormText').protect(modelable.all()).protect(localeable.all()).protect(inputable.all()).help({
    create: function() {
      return this.creator();
    },
    destroy: function() {
      return this.destroyer();
    },
    listen: function() {
      return this.listener();
    },
    find: function() {
      return this.finder();
    }
  });

  luda.component('kickoffFormTextarea').protect(modelable.all()).protect(localeable.all()).protect(inputable.except('inputCls', 'errorMarkerCls', 'inputTemplate')).protect({
    inputCls: 'kickoff-form-textarea-input',
    errorMarkerCls: 'kickoff-form-textarea-input',
    inputTemplate: function() {
      var placeholder;
      placeholder = this.fieldConfig.placeholder || '';
      return `<textarea class='${this.inputCls}' placeholder='${placeholder}' data-auto='false'></textarea>`;
    }
  }).help({
    create: function() {
      return this.creator();
    },
    destroy: function() {
      return this.destroyer();
    },
    listen: function() {
      return this.listener();
    },
    find: function() {
      return this.finder();
    }
  });

  luda.component('kickoffFormTime').protect(modelable.all()).protect(localeable.all()).protect(inputable.except('inputCls', 'errorMarkerCls', 'inputTemplate', 'getInputValue', 'setInputValue', 'toggleInputReadonly')).include({
    showDropdown: function() {
      return this.dropdown.removeClass('is-hidden');
    },
    hideDropdown: function() {
      return this.dropdown.addClass('is-hidden');
    },
    toggleDropdown: function(hide) {
      return this.dropdown.toggleClass('is-hidden', hide);
    }
  }).protect({
    inputCls: 'kickoff-form-time-input',
    errorMarkerCls: 'kickoff-form-time-selected-label',
    inputTemplate: function() {
      var placeholder;
      placeholder = this.fieldConfig.placeholder || '';
      return `<div class='kickoff-form-time-simulated'> <input class='kickoff-form-time-selected-label' readonly placeholder='${placeholder}' data-auto='false'/> <div class='kickoff-form-time-dropdown is-hidden'> <div class='kickoff-form-time-dropdown-header'> <button class='kickoff-button-form-time-ctrl-prev-month'> <i class='kickoff-ico-left'></i> </button> <label class='kickoff-form-time-header-label'></label> <button class='kickoff-button-form-time-ctrl-next-month'> <i class='kickoff-ico-right'></i> </button> </div> <table class='kickoff-form-time-month'> <thead><tr> <th>Sun</th><th>Mon</th><th>Thu</th> <th>Wes</th><th>Thr</th><th>Fri</th><th>Sat</th> </tr></thead> <tbody class='kickoff-form-time-month-dates'></tbody> </table> </div> </div>`;
    },
    renderMonth: function(time) {
      clearTimeout(this._isRenderingMonth);
      return this._isRenderingMonth = setTimeout(() => {
        var datesHtml, firstDateWeekday, lastDateWeekday, model, monthB, monthDates, monthE, monthLabel, prop, selected;
        prop = this.fieldConfig.prop;
        selected = new Time(this.getModelValue());
        [model, time] = [this.model(), new Time(time || selected)];
        [monthB, monthE] = [time.beginningOfTheMonth(), time.endOfTheMonth()];
        monthDates = Time.devideByDay(monthB, monthE);
        firstDateWeekday = monthDates[0].beginning.whatDay();
        lastDateWeekday = monthDates[monthDates.length - 1].beginning.whatDay();
        while ((firstDateWeekday -= 1) >= 0) {
          monthDates.unshift(null);
        }
        while ((lastDateWeekday += 1) <= 6) {
          monthDates.push(null);
        }
        [datesHtml = '', monthLabel = time.toString('{yyyy}/{mm}')];
        monthDates.forEach(function(date, index) {
          var checked, checkedAttr, label, value;
          if (index % 7 === 0) {
            datesHtml += '<tr>';
          }
          datesHtml += '<td>';
          if (date) {
            value = date.beginning.toString();
            label = date.beginning.toString('{yyyy}/{mm}/{dd}');
            checked = selected.beginningOfTheDay().equals(date.beginning);
            checkedAttr = checked ? 'checked' : '';
            datesHtml += `<label class='kickoff-form-time-date' data-auto='false'> <input class='kickoff-form-time-input' ${checkedAttr} name='kickoff_task_${model.uid}_${prop}' type='radio' value='${value}' data-auto='false' data-prop='${prop}' data-label='${label}' /> <span class='kickoff-form-time-input-label'> ${date.beginning.toString('{dd}')} </span> </label>`;
          }
          datesHtml += '</td>';
          if (index % 7 === 6) {
            return datesHtml += '</tr>';
          }
        });
        this.headerLabel.html(monthLabel);
        this.dates.html(datesHtml);
        return this._renderedMonth = time;
      });
    },
    renderPrevMonth: function() {
      return this.renderMonth(this._renderedMonth.prevMonth());
    },
    renderNextMonth: function() {
      return this.renderMonth(this._renderedMonth.nextMonth());
    },
    toggleInputReadonly: function() {
      var model, prop, propIsReadonly, topLevelProp, val;
      ({prop, topLevelProp} = this.fieldConfig);
      model = this.model();
      propIsReadonly = model.readonly(topLevelProp) || model.readonly(prop);
      if (propIsReadonly) {
        this.setInputValue();
      }
      val = propIsReadonly ? '' : null;
      this.simulatedInput.toggleClass('is-readonly', propIsReadonly);
      this.input.attr('disabled', val);
      return this.date.attr('readonly', val);
    },
    setInputValue: function() {
      return this.renderMonth(this.getModelValue());
    },
    getInputValue: function() {
      return this.input.filter(':checked').val();
    },
    setInputValueWhenNoError: function() {
      this.setSimulatedInputValue();
      if (this.model().error(this.fieldConfig.prop)) {
        return;
      }
      return this.setInputValue();
    },
    setSimulatedInputValue: function() {
      var checkedInput;
      if (!(checkedInput = this.input.filter(':checked')).length) {
        return;
      }
      return this.simulatedInput.val(checkedInput.data('label'));
    },
    toggleDropdownHandler: function(event) {
      var prop, topLevelProp;
      ({prop, topLevelProp} = this.fieldConfig);
      if (this.model().readonly(topLevelProp) || this.model().readonly(prop)) {
        return;
      }
      if (event.type === 'focusin') {
        return this.showDropdown();
      } else if (event.type === 'change') {
        return this.hideDropdown();
      }
    },
    toggleDropdownBySimulatedInputHandler: function(event) {
      var isHidden, prop, topLevelProp;
      ({prop, topLevelProp} = this.fieldConfig);
      if (this.model().readonly(topLevelProp) || this.model().readonly(prop)) {
        return;
      }
      if (event.type === 'focusin') {
        isHidden = this.dropdown.hasClass('is-hidden');
        this.showDropdown();
        return this._handledByFocusin = isHidden;
      } else if (event.type === 'click') {
        if (!this._handledByFocusin) {
          this.toggleDropdown();
        }
        return delete this._handledByFocusin;
      }
    }
  }).help({
    create: function() {
      return this.creator();
    },
    destroy: function() {
      return this.destroyer();
    },
    listen: function() {
      return this.listener().concat([
        ['click',
        '.kickoff-button-form-time-ctrl-next-month',
        this.renderNextMonth],
        ['click',
        '.kickoff-button-form-time-ctrl-prev-month',
        this.renderPrevMonth],
        ['change',
        '.kickoff-form-time-input',
        this.setInputValueWhenNoError],
        ['focusin change',
        '.kickoff-form-time-input',
        this.toggleDropdownHandler],
        ['focusin click',
        '.kickoff-form-time-selected-label',
        this.toggleDropdownBySimulatedInputHandler],
        [
          'focusin click',
          function(e) {
            var focusedTime,
          targets;
            focusedTime = null;
            e.eventPath().some(function(element) {
              if (luda(element).is('.kickoff-form-time')) {
                focusedTime = element;
                return true;
              }
            });
            targets = luda('.kickoff-form-time').not(focusedTime);
            return luda.kickoffFormTime(targets).hideDropdown();
          }
        ]
      ]);
    },
    watch: function() {
      return {
        node: [['.kickoff-form-time-input', this.setSimulatedInputValue]]
      };
    },
    find: function() {
      return Object.assign(this.finder(), {
        simulatedInput: '.kickoff-form-time-selected-label',
        dropdown: '.kickoff-form-time-dropdown',
        date: '.kickoff-form-time-date',
        headerLabel: '.kickoff-form-time-header-label',
        dates: '.kickoff-form-time-month-dates'
      });
    }
  });

  var ancestors, children, descendants, firstChild, lastChild, nextSibling, nextSiblings, prevSibling, prevSiblings, where;

  children = function(task, ruleFn) {
    var taskWbs;
    mustExist(task);
    if (isRoot(task)) {
      return task.tasks.filter(function(t) {
        return splitWbs(t.data.wbs).length === 1;
      });
    }
    taskWbs = splitWbs(task.data.wbs);
    return root(task).tasks.filter(function(t) {
      var isChd, tWbs;
      tWbs = splitWbs(t.data.wbs);
      if (tWbs.length !== taskWbs.length + 1) {
        return false;
      }
      isChd = !taskWbs.some(function(n, i) {
        return n !== tWbs[i];
      });
      if (ruleFn) {
        return isChd && ruleFn(t);
      } else {
        return isChd;
      }
    });
  };

  firstChild = function(task) {
    var chd;
    mustExist(task);
    if (!(chd = children(task)).length) {
      return null;
    }
    return (asc(...chd))[0];
  };

  lastChild = function(task) {
    var chd;
    mustExist(task);
    if (!(chd = children(task)).length) {
      return null;
    }
    return (desc(...chd))[0];
  };

  prevSiblings = function(task, ruleFn) {
    var chd;
    mustExist(task);
    if (isRoot(task)) {
      return [];
    }
    chd = asc(...children(parent(task, true), ruleFn));
    return chd.slice(0, chd.indexOf(task));
  };

  prevSibling = function(task) {
    var siblingWbs;
    mustExist(task);
    if (isRoot(task)) {
      return null;
    }
    siblingWbs = prevWbs(task.data.wbs);
    if (!siblingWbs) {
      return null;
    }
    return find(root(task), siblingWbs);
  };

  nextSiblings = function(task, ruleFn) {
    var chd;
    mustExist(task);
    if (isRoot(task)) {
      return [];
    }
    chd = asc(...children(parent(task, true), ruleFn));
    return chd.slice(chd.indexOf(task) + 1);
  };

  nextSibling = function(task) {
    var siblingWbs;
    mustExist(task);
    if (isRoot(task)) {
      return null;
    }
    siblingWbs = nextWbs(task.data.wbs);
    if (!siblingWbs) {
      return null;
    }
    return find(root(task), siblingWbs);
  };

  descendants = function(task, ruleFn) {
    var taskWbs;
    mustExist(task);
    if (isRoot(task)) {
      return task.tasks;
    }
    taskWbs = splitWbs(task.data.wbs);
    return root(task).tasks.filter(function(t) {
      var isDescendant, tWbs;
      tWbs = splitWbs(t.data.wbs);
      if (!(tWbs.length > taskWbs.length)) {
        return false;
      }
      isDescendant = !taskWbs.some(function(n, i) {
        return n !== tWbs[i];
      });
      if (ruleFn) {
        return isDescendant && ruleFn(t);
      } else {
        return isDescendant;
      }
    });
  };

  ancestors = function(task, ruleFn, includeRoot = false) {
    var collected, taskWbs;
    mustExist(task);
    if (isRoot(task)) {
      return [];
    }
    taskWbs = splitWbs(task.data.wbs);
    collected = root(task).tasks.filter(function(t) {
      var isAncestor, tWbs;
      tWbs = splitWbs(t.data.wbs);
      if (!(tWbs.length < taskWbs.length)) {
        return false;
      }
      isAncestor = !tWbs.some(function(n, i) {
        return n !== taskWbs[i];
      });
      if (ruleFn) {
        return isAncestor && ruleFn(t);
      } else {
        return isAncestor;
      }
    });
    if (includeRoot) {
      collected.unshift(root(task));
    }
    return collected;
  };

  where = function(task, conOrRule) {
    mustExist(task);
    if (typeof conOrRule === 'function') {
      return descendants(task).filter(function(t) {
        return conOrRule(t);
      });
    } else if (typeof conOrRule === 'object') {
      return descendants(task).filter(function(t) {
        var key, val;
        for (key in conditions) {
          val = conditions[key];
          if (t.data[key] !== val) {
            return false;
          }
        }
        return true;
      });
    } else {
      return [];
    }
  };

  Task.prototype.root = function() {
    return root(this);
  };

  Task.prototype.children = function(ruleFn) {
    return children(this, ruleFn);
  };

  Task.prototype.firstChild = function() {
    return firstChild(this);
  };

  Task.prototype.lastChild = function() {
    return lastChild(this);
  };

  Task.prototype.nextSiblings = function(ruleFn) {
    return nextSiblings(this, ruleFn);
  };

  Task.prototype.nextSibling = Task.prototype.next = function() {
    return nextSibling(this);
  };

  Task.prototype.prevSiblings = function(ruleFn) {
    return prevSiblings(this, ruleFn);
  };

  Task.prototype.prevSibling = Task.prototype.prev = function() {
    return prevSibling(this);
  };

  Task.prototype.descendants = Task.prototype.tasks = function(ruleFn) {
    return descendants(this, ruleFn);
  };

  Task.prototype.ancestors = function(ruleFn, includeRoot = false) {
    return ancestors(this, ruleFn, includeRoot);
  };

  Task.prototype.parent = function(includeRoot = false) {
    return parent(this, includeRoot);
  };

  Task.prototype.find = function(uidOrWbs) {
    return find(root(this), uidOrWbs);
  };

  Task.prototype.where = function(conOrRule) {
    return where(this, conOrRule);
  };

  var isMilestone, isTask$1, type;

  isTask$1 = function(task) {
    mustBeTask(task);
    return task.data.type !== 'milestone';
  };

  isMilestone = function(task) {
    mustBeTask(task);
    return task.data.type === 'milestone';
  };

  type = function(task) {
    mustExist(task);
    if (isTask$1(task)) {
      return 'task';
    } else {
      return 'milestone';
    }
  };

  Task.prototype.type = function() {
    return type(this);
  };

  Task.prototype.isTask = function() {
    return isTask$1(this);
  };

  Task.prototype.isMilestone = function() {
    return isMilestone(this);
  };

  var CustomEvent$1, mustBeValidCallback, nsMatches, parseEvent;

  CustomEvent$1 = class CustomEvent {
    constructor(target, event, detail = null, original = {}) {
      var type;
      ({type} = parseEvent(event));
      this.type = type;
      this.target = target;
      this.originalTarget = original.target || target;
      this.original = Object.assign({
        target: this.originalTarget
      }, original);
      this.detail = detail;
      this._stopped = false;
      this._immediateStopped = false;
      this._prevented = false;
    }

    stopImmediatePropagation() {
      return this._immediateStopped = true;
    }

    stopPropagation() {
      return this._stopped = true;
    }

    preventDefault() {
      return this._prevented = true;
    }

    isImmediatePropagationStopped() {
      return this._immediateStopped === true;
    }

    isPropagationStopped() {
      return this._stopped === true;
    }

    isDefaultPrevented() {
      return this._prevented === true;
    }

  };

  mustBeValidCallback = function(callback) {
    if (!luda.isFunction(callback)) {
      throw new Error(`Invalid callback: ${callback}`);
    }
  };

  parseEvent = function(event = '') {
    var splited;
    if (!(luda.isString(event) && event.trim().length)) {
      throw new Error(`Invalid event ${event}`);
    }
    splited = event.split('.');
    return {
      type: splited[0],
      namespace: splited.slice(1)
    };
  };

  nsMatches = function(ns, definedNs) {
    return ns.every(function(n) {
      return definedNs.includes(n);
    });
  };

  var TaskEvent, addEvent, addEventOnce, eventCache, removeEvent, triggerEvent;

  TaskEvent = class TaskEvent extends CustomEvent$1 {};

  eventCache = function(task, type) {
    var cache;
    cache = root(task).events;
    return cache[type] || (cache[type] = []);
  };

  addEvent = function(task, event, callback, _one = false) {
    var namespace, type;
    ({type, namespace} = parseEvent(event));
    mustBeValidCallback(callback);
    mustExist(task);
    return eventCache(task, type).push({task, namespace, callback, _one});
  };

  addEventOnce = function(task, event, callback) {
    return addEvent(task, event, callback, true);
  };

  removeEvent = function(task, event, callback) {
    var i, len, namespace, results, type, types;
    if (event) {
      ({type, namespace} = parseEvent(event));
    }
    if (callback) {
      mustBeValidCallback(callback);
    }
    mustExist(task);
    eventCache(task, type);
    types = type ? [type] : Object.keys(root(task).events);
    results = [];
    for (i = 0, len = types.length; i < len; i++) {
      type = types[i];
      results.push(root(task).events[type] = eventCache(task, type).filter(function(q) {
        if (task.uid !== q.task.uid) {
          return true;
        }
        if (callback && callback !== q.callback) {
          return true;
        }
        if (namespace && namespace.length && !nsMatches(namespace, q.namespace)) {
          return true;
        }
      }));
    }
    return results;
  };

  triggerEvent = function(task, event, detail, original) {
    var eventPath, eventQuene, namespace, shouldTrigger, taskEvent, type;
    mustExist(task);
    ({type, namespace} = parseEvent(event));
    shouldTrigger = task.created || type === 'before-create';
    if (!shouldTrigger) {
      return;
    }
    taskEvent = new TaskEvent(task, event, detail, original);
    eventQuene = eventCache(task, type);
    eventPath = desc(...ancestors(task, null, true).concat(task));
    eventPath.some(function(t) {
      eventQuene.some(function(q) {
        if (t.uid !== q.task.uid) {
          return;
        }
        if (!nsMatches(namespace, q.namespace)) {
          return;
        }
        taskEvent.currentTarget = t;
        if (q.callback.call(t, taskEvent, taskEvent.detail) === false) {
          taskEvent.stopPropagation();
          taskEvent.preventDefault();
        }
        if (q._one) {
          removeEvent(task, event, q.callback);
        }
        return taskEvent.isImmediatePropagationStopped();
      });
      return taskEvent.isPropagationStopped();
    });
    return !taskEvent.isDefaultPrevented();
  };

  Task.prototype.on = function(event, callback) {
    addEvent(this, event, callback);
    return this;
  };

  Task.prototype.one = function(event, callback) {
    addEventOnce(this, event, callback);
    return this;
  };

  Task.prototype.off = function(event, callback) {
    removeEvent(this, event, callback);
    return this;
  };

  Task.prototype.trigger = function(event, detail, _needResult) {
    var isTriggered;
    isTriggered = triggerEvent(this, event, detail) !== false;
    if (_needResult) {
      return isTriggered;
    }
    return this;
  };

  var addDeps, addF2FDeps, addF2SDeps, addS2FDeps, addS2SDeps, beforeUpdateDeps, collectDepdWbsData, compareNewAndOld, depWbses, depcType, deps, f2fDeps, f2sDeps, isValidDepc, parseDeps, removeDeps, s2fDeps, s2sDeps, touchDeps, triggerDepsEvent, tryUpdateDeps, typeMustBeValid;

  typeMustBeValid = function(type) {
    if (!depcTypes.includes(type)) {
      type = depcTypes[depcTypeShortcuts.indexOf(type)];
    }
    if (!depcTypes.includes(type)) {
      throw new Error(`Invalid type: ${type}`);
    }
    return type;
  };

  depWbses = function(task, type = '') {
    var depsObj, wbses;
    depsObj = task.data.dependencies;
    if (!type) {
      wbses = [];
      depcTypes.forEach(function(t) {
        return wbses = wbses.concat(splitDeps(depsObj[t]));
      });
      return wbses;
    }
    // return types.map((t) -> splitDeps depsObj[t]).flat() unless type
    type = typeMustBeValid(type);
    return splitDeps(depsObj[type]);
  };

  parseDeps = function(task, ...deps) {
    var depTasks;
    depTasks = [];
    deps.forEach(function(d) {
      if (!(d instanceof Task)) {
        d = find(root(task), d);
      }
      if (d && d.rootId === task.rootId) {
        return depTasks.push(d);
      }
    });
    return depTasks;
  };

  compareNewAndOld = function(task, type = '', newVals = []) {
    var newVal, oldVal, oldVals;
    type = typeMustBeValid(type);
    oldVals = depWbses(task, type);
    oldVal = joinDeps(oldVals);
    if (typeof newVals === 'string') {
      newVals = splitDeps(newVals);
    }
    newVal = joinDeps(newVals);
    return {
      newVal,
      oldVal,
      oldVals,
      newVals,
      isEqual: newVal === oldVal
    };
  };

  collectDepdWbsData = function(task, filter) {
    var i, len, type, val;
    mustExist(task);
    val = {};
    for (i = 0, len = depcTypes.length; i < len; i++) {
      type = depcTypes[i];
      val[type] = joinDeps(task.depd(type, filter).map(function(t) {
        return t.data.wbs;
      }));
    }
    return val;
  };

  triggerDepsEvent = function(task, event, type, detail, _original) {
    var depdDetail, depsDetail, isDepdEventPrevented, isDepsEventPrevented, isPrevented, key, newDeps, newVal, oldDeps, oldVal, ref, typeDetail, val;
    type = typeMustBeValid(type);
    // trigger dependencies event of current task
    typeDetail = {};
    typeDetail[type] = detail;
    isPrevented = triggerEvent(task, event, typeDetail, _original) === false;
    if (isPrevented && event === 'before-update') {
      return false;
    }
    // trigger predecessor event of current task
    depsDetail = {
      predecessors: {}
    };
    [newVal, oldVal] = [{}, {}];
    ref = task.data.dependencies;
    for (key in ref) {
      val = ref[key];
      if (key === type) {
        newVal[key] = detail.newVal;
        oldVal[key] = detail.oldVal;
      } else {
        newVal[key] = oldVal[key] = val;
      }
    }
    depsDetail.predecessors.newVal = newVal;
    depsDetail.predecessors.oldVal = oldVal;
    isDepsEventPrevented = triggerEvent(task, event, depsDetail, _original) === false;
    isPrevented || (isPrevented = isDepsEventPrevented);
    if (isPrevented && event === 'before-update') {
      return false;
    }
    // trigger successors events of current task's predecessors
    depdDetail = {
      successors: {}
    };
    oldDeps = splitDeps(oldVal[type]).map(function(wbs) {
      return find(root(task), wbs);
    });
    newDeps = splitDeps(newVal[type]).map(function(wbs) {
      return find(root(task), wbs);
    });
    isDepdEventPrevented = luda.unique(oldDeps.concat(newDeps)).some(function(t) {
      var depdWbsArr, existInNew, existInOld;
      if (!t) {
        return;
      }
      existInOld = oldDeps.includes(t);
      existInNew = newDeps.includes(t);
      if (!task.created) {
        existInNew = false;
      }
      if (existInNew && existInOld) {
        return;
      }
      if (event === 'before-update') {
        oldVal = collectDepdWbsData(t);
        newVal = JSON.parse(JSON.stringify(oldVal));
        depdWbsArr = splitDeps(oldVal[type]);
        if (existInNew) {
          depdWbsArr.push(task.data.wbs);
        } else {
          depdWbsArr.splice(depdWbsArr.indexOf(task.data.wbs), 1);
        }
        newVal[type] = joinDeps(depdWbsArr);
      } else {
        newVal = collectDepdWbsData(t);
        oldVal = JSON.parse(JSON.stringify(newVal));
        depdWbsArr = splitDeps(newVal[type]);
        if (existInNew) {
          depdWbsArr.splice(depdWbsArr.indexOf(task.data.wbs), 1);
        } else {
          depdWbsArr.push(task.data.wbs);
        }
        oldVal[type] = joinDeps(depdWbsArr);
        t.depended = newVal; // hack
      }
      depdDetail.successors.newVal = newVal;
      depdDetail.successors.oldVal = oldVal;
      return triggerEvent(t, event, depdDetail, _original) === false;
    });
    isPrevented || (isPrevented = isDepdEventPrevented);
    if (isPrevented && event === 'before-update') {
      return false;
    }
    return !isPrevented;
  };

  beforeUpdateDeps = function(task, type, newVals = [], _returnSchedul, _original = {}) {
    var isEqual, newB, newE, newVal, oldVal, oldVals, original, resources, result, schedules, triggered;
    original = Object.assign({
      target: task,
      prop: `predecessors.${type}`
    }, _original);
    [triggered, schedules] = [true, []];
    result = function() {
      if (_returnSchedul) {
        return {triggered, schedules};
      } else {
        return triggered;
      }
    };
    ({newVal, oldVal, oldVals, isEqual} = compareNewAndOld(task, type, newVals));
    if (isEqual) {
      return result();
    }
    triggered = triggerDepsEvent(task, 'before-update', type, {newVal, oldVal}, original);
    if (!triggered) {
      return result();
    }
    if (!newVals.some(function(v) {
      return !oldVals.includes(v);
    })) {
      return result();
    }
    task.data.dependencies[type] = newVal;
    [newB, newE] = [task.data.beginning, task.data.end];
    ({triggered, resources} = task._beforeUpdateSchedule({
      beginning: newB,
      end: newE
    }, 'flex', _returnSchedul, original));
    schedules = resources;
    task.data.dependencies[type] = oldVal;
    return result();
  };

  touchDeps = function(task, type, newVals = [], _schedules = [], _original = {}) {
    var isEqual, newBegin, newEnd, newVal, oldVal, original;
    original = Object.assign({
      target: task,
      prop: `predecessors.${type}`
    }, _original);
    ({newVal, oldVal, isEqual} = compareNewAndOld(task, type, newVals));
    if (!isEqual) {
      task.data.dependencies[type] = newVal;
      [newBegin, newEnd] = [task.data.beginning, task.data.end];
      task._touchSchedule({
        beginning: newBegin,
        end: newEnd
      }, 'flex', _schedules, original);
    }
    triggerDepsEvent(task, 'after-touch', type, {newVal, oldVal}, original);
    if (isEqual) {
      return;
    }
    return triggerDepsEvent(task, 'after-update', type, {newVal, oldVal}, original);
  };

  tryUpdateDeps = function(task, type, newVals = [], _original) {
    var schedules, triggered;
    ({triggered, schedules} = beforeUpdateDeps(task, type, newVals, true, _original));
    if (!triggered) {
      newVals = depWbses(task, type);
    }
    touchDeps(task, type, newVals, schedules, _original);
    return triggered;
  };

  deps = function(task, type = '', ruleFn, deep = false) {
    var collected, index, wbses;
    mustExist(task);
    if (isRoot(task)) {
      return [];
    }
    wbses = depWbses(task, type);
    collected = root(task).tasks.filter(function(t) {
      var matched;
      matched = wbses.includes(t.data.wbs);
      if (ruleFn) {
        return matched && ruleFn(t);
      } else {
        return matched;
      }
    });
    if (!deep) {
      return collected;
    }
    index = 0;
    while (index < collected.length) {
      collected = collected.concat(deps(collected[index], type, ruleFn));
      index += 1;
    }
    return luda.unique(collected);
  };

  f2sDeps = function(task, ruleFn, deep) {
    return deps(task, 'finishToStart', ruleFn, deep);
  };

  s2sDeps = function(task, ruleFn, deep) {
    return deps(task, 'startToStart', ruleFn, deep);
  };

  f2fDeps = function(task, ruleFn, deep) {
    return deps(task, 'finishToFinish', ruleFn, deep);
  };

  s2fDeps = function(task, ruleFn, deep) {
    return deps(task, 'startToFinish', ruleFn, deep);
  };

  isValidDepc = function(depc, task) {
    depc = parseDeps(task, depc)[0];
    if (!depc) {
      return false;
    }
    if (task === depc) {
      return false;
    }
    if (ancestors(task).includes(depc)) {
      return false;
    }
    if (descendants(task).includes(depc)) {
      return false;
    }
    if (!task.created) {
      return true;
    }
    if (deps(task).includes(depc)) {
      return false;
    }
    if (task.depd(null, null, true).includes(depc)) {
      return false;
    }
    // return false if depd(task, null, null, true).includes depc
    return true;
  };

  addDeps = function(task, type, depTasks = [], _original) {
    var addedWbs;
    mustExist(task);
    if (isRoot(task)) {
      return;
    }
    addedWbs = [];
    parseDeps(task, ...depTasks).forEach(function(depc) {
      if (isValidDepc(depc, task)) {
        return addedWbs.push(depc.data.wbs);
      }
    });
    if (!addedWbs.length) {
      return;
    }
    return tryUpdateDeps(task, type, depWbses(task, type).concat(addedWbs), _original);
  };

  addF2SDeps = function(task, ...deps) {
    return addDeps(task, 'finishToStart', deps);
  };

  addS2SDeps = function(task, ...deps) {
    return addDeps(task, 'startToStart', deps);
  };

  addF2FDeps = function(task, ...deps) {
    return addDeps(task, 'finishToFinish', deps);
  };

  addS2FDeps = function(task, ...deps) {
    return addDeps(task, 'startToFinish', deps);
  };

  removeDeps = function(task, deps = [], _original) {
    var depTasks, key, ref, val;
    mustExist(task);
    if (isRoot(task)) {
      return;
    }
    if (!deps.length) {
      ref = task.data.dependencies;
      for (key in ref) {
        val = ref[key];
        tryUpdateDeps(task, key, [], _original);
      }
      return;
    }
    depTasks = parseDeps(task, ...deps);
    return depcTypes.forEach(function(t) {
      var arr;
      arr = depWbses(task, t);
      depTasks.forEach(function(d) {
        var index;
        if ((index = arr.indexOf(d.data.wbs)) >= 0) {
          return arr.splice(index, 1);
        }
      });
      return tryUpdateDeps(task, t, arr, _original);
    });
  };

  depcType = function(task, depc) {
    var shortcut, type;
    mustExist(task);
    if (!depc) {
      return;
    }
    depc = parseDeps(task, depc)[0];
    type = '';
    depcTypes.some(function(t) {
      var wbses;
      wbses = depWbses(task, t);
      if (!wbses.includes(depc.data.wbs)) {
        return false;
      }
      return type = t;
    });
    shortcut = depcTypeShortcuts[depcTypes.indexOf(type)] || '';
    return {type, shortcut};
  };

  Task.prototype.predecessors = Task.prototype.deps = function(type, ruleFn, deep) {
    return deps(this, type, ruleFn, deep);
  };

  Task.prototype.f2sPredecessors = Task.prototype.f2sDeps = function(ruleFn, deep) {
    return f2sDeps(this, ruleFn, deep);
  };

  Task.prototype.s2sPredecessors = Task.prototype.s2sDeps = function(ruleFn, deep) {
    return s2sDeps(this, ruleFn, deep);
  };

  Task.prototype.f2fPredecessors = Task.prototype.f2fDeps = function(ruleFn, deep) {
    return f2fDeps(this, ruleFn, deep);
  };

  Task.prototype.s2fPredecessors = Task.prototype.s2fDeps = function(ruleFn, deep) {
    return s2fDeps(this, ruleFn, deep);
  };

  Task.prototype.isValidPredecessorOf = Task.prototype.isValidDepcOf = function(depd) {
    if (!(depd = parseDeps(this, depd)[0])) {
      return false;
    }
    return isValidDepc(this, depd);
  };

  Task.prototype._addDeps = function(type, ...deps) {
    addDeps(this, type, deps);
    return this;
  };

  Task.prototype.addPredecessors = Task.prototype.addDeps = function(type, ...deps) {
    this._pushUndoState(() => {
      return addDeps(this, type, deps);
    });
    return this;
  };

  Task.prototype.addF2SPredecessors = Task.prototype.addF2SDeps = function(...deps) {
    this._pushUndoState(() => {
      return addF2SDeps(this, ...deps);
    });
    return this;
  };

  Task.prototype.addS2SPredecessors = Task.prototype.addS2SDeps = function(...deps) {
    this._pushUndoState(() => {
      return addS2SDeps(this, ...deps);
    });
    return this;
  };

  Task.prototype.addF2FPredecessors = Task.prototype.addF2FDeps = function(...deps) {
    this._pushUndoState(() => {
      return addF2FDeps(this, ...deps);
    });
    return this;
  };

  Task.prototype.addS2FPredecessors = Task.prototype.addS2FDeps = function(...deps) {
    this._pushUndoState(() => {
      return addS2FDeps(this, ...deps);
    });
    return this;
  };

  Task.prototype.removePredecessors = Task.prototype.removeDeps = function(...deps) {
    this._pushUndoState(() => {
      return removeDeps(this, deps);
    });
    return this;
  };

  Task.prototype.predecessorType = Task.prototype.depcType = function(depc) {
    return depcType(this, depc);
  };

  var addDepd, addF2FDepd, addF2SDepd, addS2FDepd, addS2SDepd, depd, depdType, f2fDepd, f2sDepd, isValidDepd, removeDepd, s2fDepd, s2sDepd;

  depd = function(task, type = '', ruleFn, deep = false) {
    var collected, index;
    mustExist(task);
    if (isRoot(task)) {
      return [];
    }
    collected = root(task).tasks.filter(function(t) {
      var matched;
      matched = depWbses(t, type).includes(task.data.wbs);
      if (ruleFn) {
        return matched && ruleFn(t);
      } else {
        return matched;
      }
    });
    if (!deep) {
      return collected;
    }
    index = 0;
    while (index < collected.length) {
      collected = collected.concat(depd(collected[index], type, ruleFn));
      index += 1;
    }
    return luda.unique(collected);
  };

  f2sDepd = function(task, ruleFn, deep) {
    return depd(task, 'finishToStart', ruleFn, deep);
  };

  s2sDepd = function(task, ruleFn, deep) {
    return depd(task, 'startToStart', ruleFn, deep);
  };

  f2fDepd = function(task, ruleFn, deep) {
    return depd(task, 'finishToFinish', ruleFn, deep);
  };

  s2fDepd = function(task, ruleFn, deep) {
    return depd(task, 'startToFinish', ruleFn, deep);
  };

  isValidDepd = function(depd, task) {
    return isValidDepc(task, depd);
  };

  addDepd = function(task, type, depds = [], _original = {}) {
    var depc, isPrevented, original, resources, tasks;
    // original = Object.assign(
    //   {target: task, prop: "successors.#{type}"}, _original
    // )
    // parseDeps(task, depds...).forEach (d) -> addDeps d, type, [task], original
    original = Object.assign({
      target: task,
      prop: `successors.${type}`
    }, _original);
    depc = task;
    mustExist(depc);
    if (isRoot(depc)) {
      return;
    }
    resources = [];
    tasks = parseDeps(depc, ...depds);
    isPrevented = tasks.some(function(task) {
      var newVals, oldVals, schedules, triggered;
      if (!isValidDepc(depc, task)) {
        return;
      }
      oldVals = depWbses(task, type);
      newVals = oldVals.concat(depc.data.wbs);
      ({triggered, schedules} = beforeUpdateDeps(task, type, newVals, true, original));
      resources.push({task, type, newVals, schedules});
      return !triggered;
    });
    if (isPrevented) {
      resources = [];
      tasks.forEach(function(task) {
        if (!isValidDepc(depc, task)) {
          return;
        }
        return resources.push({
          task,
          type,
          newVals: depWbses(task, type),
          schedules: []
        });
      });
    }
    return resources.forEach(function(r) {
      var newVals, schedules;
      ({task, type, newVals, schedules} = r);
      return touchDeps(task, type, newVals, schedules, original);
    });
  };

  addF2SDepd = function(task, ...depd) {
    return addDepd(task, 'finishToStart', depd);
  };

  addS2SDepd = function(task, ...depd) {
    return addDepd(task, 'startToStart', depd);
  };

  addF2FDepd = function(task, ...depd) {
    return addDepd(task, 'finishToFinish', depd);
  };

  addS2FDepd = function(task, ...depd) {
    return addDepd(task, 'startToFinish', depd);
  };

  removeDepd = function(task, depds = [], _original = {}) {
    var depc, isPrevented, resources, tasks;
    // if depds.length
    //   depds = parseDeps task, depds...
    // else
    //   depds = depd task
    // depds.forEach (d) ->
    //   original = Object.assign(
    //     {target: task, prop: "successors.#{depdType task, d}"}, _original
    //   )
    //   removeDeps d, [task], original
    depc = task;
    mustExist(depc);
    if (isRoot(depc)) {
      return;
    }
    if (depds.length) {
      tasks = parseDeps(depc, ...depds);
    } else {
      tasks = depd(depc);
    }
    resources = [];
    isPrevented = tasks.some(function(task) {
      var index, newVals, original, schedules, triggered, type;
      if (!(type = depdType(depc, task).type)) {
        return;
      }
      newVals = depWbses(task, type);
      if ((index = newVals.indexOf(depc.data.wbs)) >= 0) {
        newVals.splice(index, 1);
      }
      original = Object.assign({
        target: depc,
        prop: `successors.${type}`
      }, _original);
      ({triggered, schedules} = beforeUpdateDeps(task, type, newVals, true, original));
      resources.push({task, type, newVals, schedules, original});
      return !triggered;
    });
    if (isPrevented) {
      resources = [];
      tasks.forEach(function(task) {
        var newVals, original, type;
        if (!(type = depdType(depc, task).type)) {
          return;
        }
        newVals = depWbses(task, type);
        original = Object.assign({
          target: depc,
          prop: `successors.${type}`
        }, _original);
        return resources.push({
          task,
          type,
          newVals,
          schedules: [],
          original
        });
      });
    }
    return resources.forEach(function(r) {
      var newVals, original, schedules, type;
      ({task, type, newVals, schedules, original} = r);
      return touchDeps(task, type, newVals, schedules, original);
    });
  };

  depdType = function(task, depd) {
    return depcType(depd, task);
  };

  Task.prototype.successors = Task.prototype.depd = function(type, ruleFn, deep) {
    return depd(this, type, ruleFn, deep);
  };

  Task.prototype.f2sSuccessors = Task.prototype.f2sDepd = function(ruleFn, deep) {
    return f2sDepd(this, ruleFn, deep);
  };

  Task.prototype.s2sSuccessors = Task.prototype.s2sDepd = function(ruleFn, deep) {
    return s2sDepd(this, ruleFn, deep);
  };

  Task.prototype.f2fSuccessors = Task.prototype.f2fDepd = function(ruleFn, deep) {
    return f2fDepd(this, ruleFn, deep);
  };

  Task.prototype.s2fSuccessors = Task.prototype.s2fDepd = function(ruleFn, deep) {
    return s2fDepd(this, ruleFn, deep);
  };

  Task.prototype.isValidSuccessorOf = Task.prototype.isValidDepdOf = function(depc) {
    return isValidDepd(this, depc);
  };

  Task.prototype.addSuccessors = Task.prototype.addDepd = function(type, ...depd) {
    this._pushUndoState(() => {
      return addDepd(this, type, depd);
    });
    return this;
  };

  Task.prototype.addF2SSuccessors = Task.prototype.addF2SDepd = function(...depd) {
    this._pushUndoState(() => {
      return addF2SDepd(this, ...depd);
    });
    return this;
  };

  Task.prototype.addS2SSuccessors = Task.prototype.addS2SDepd = function(...depd) {
    this._pushUndoState(() => {
      return addS2SDepd(this, ...depd);
    });
    return this;
  };

  Task.prototype.addF2FSuccessors = Task.prototype.addF2FDepd = function(...depd) {
    this._pushUndoState(() => {
      return addF2FDepd(this, ...depd);
    });
    return this;
  };

  Task.prototype.addS2FSuccessors = Task.prototype.addS2FDepd = function(...depd) {
    this._pushUndoState(() => {
      return addS2FDepd(this, ...depd);
    });
    return this;
  };

  Task.prototype.removeSuccessors = Task.prototype.removeDepd = function(...depd) {
    this._pushUndoState(() => {
      return removeDepd(this, depd);
    });
    return this;
  };

  Task.prototype.successorType = Task.prototype.depdType = function(depd) {
    return depdType(this, depd);
  };

  var addUniqueResource, beforeUpdateSchedule, checkEarlistTaskEnd, checkEarlistTreeBegin, checkEarlistTreeEnd, collectResources, collectTreeDownTravelResources, collectTreeLeafBackwardBeginResources, collectTreeLeafBackwardEndResources, collectTreeLeafForwardBeginResources, collectTreeLeafForwardEndResources, createF2FDepdEntries, createF2SDepdEntries, createS2FDepdEntries, createS2SDepdEntries, descResources, earlistTaskEnd, hasNoTaskChildren, mergeOriginal, propagateResources, taskBeginByEndDiff, taskEndByBeginDiff, touchSchedule, tryUpdateSchedule;

  earlistTaskEnd = function(task, newBegin) {
    var minDuration;
    if (isMilestone(task)) {
      return new Time(newBegin);
    }
    minDuration = root(task).data.minDurationSeconds;
    return new Time(newBegin).nextSecond(minDuration);
  };

  checkEarlistTaskEnd = function(task, newBegin) {
    var current, earlist, ok;
    current = new Time(task.data.end);
    earlist = earlistTaskEnd(task, newBegin);
    ok = !current.earlierThan(earlist);
    return {ok, current, earlist};
  };

  taskEndByBeginDiff = function(task, newBegin) {
    var diff;
    diff = new Time(task.data.beginning).to(newBegin).seconds;
    return new Time(task.data.end).calcSeconds(diff);
  };

  taskBeginByEndDiff = function(task, newEnd) {
    var diff;
    diff = new Time(task.data.end).to(newEnd).seconds;
    return new Time(task.data.beginning).calcSeconds(diff);
  };

  hasNoTaskChildren = function(task) {
    var taskChildren;
    if ((taskChildren = children(task)).length === 0) {
      return true;
    }
    return !taskChildren.some(function(chd) {
      return !isMilestone(chd);
    });
  };

  createS2SDepdEntries = function(task, newBegin, filter, mode = 'travel') {
    var entries;
    entries = [];
    s2sDepd(task, filter).forEach(function(depd) {
      var currentBegin, earlist, entry, ok;
      currentBegin = new Time(depd.data.beginning);
      if (!currentBegin.earlierThan(newBegin)) {
        return;
      }
      entry = {
        mode,
        task: depd,
        newBegin
      };
      if (mode === 'travel' || isMilestone(depd)) {
        entry.newEnd = taskEndByBeginDiff(depd, entry.newBegin);
      } else {
        ({ok, earlist} = checkEarlistTaskEnd(depd, entry.newBegin));
        if (!ok) {
          entry.newEnd = earlist;
        }
      }
      return entries.push(entry);
    });
    return entries;
  };

  createS2FDepdEntries = function(task, newBegin, filter, mode = 'travel') {
    var entries;
    entries = [];
    s2fDepd(task, filter).forEach(function(depd) {
      var currentEnd, entry;
      currentEnd = new Time(depd.data.end);
      if (!currentEnd.earlierThan(newBegin)) {
        return;
      }
      entry = {
        mode,
        task: depd,
        newEnd: newBegin
      };
      if (mode === 'travel' || isMilestone(depd)) {
        entry.newBegin = taskBeginByEndDiff(depd, entry.newEnd);
      }
      return entries.push(entry);
    });
    return entries;
  };

  createF2FDepdEntries = function(task, newEnd, filter, mode = 'travel') {
    var entries;
    entries = [];
    f2fDepd(task, filter).forEach(function(depd) {
      var currentEnd, entry;
      currentEnd = new Time(depd.data.end);
      if (!currentEnd.earlierThan(newEnd)) {
        return;
      }
      entry = {
        mode,
        task: depd,
        newEnd
      };
      if (mode === 'travel' || isMilestone(depd)) {
        entry.newBegin = taskBeginByEndDiff(depd, entry.newEnd);
      }
      return entries.push(entry);
    });
    return entries;
  };

  createF2SDepdEntries = function(task, newEnd, filter, mode = 'travel') {
    var entries;
    entries = [];
    f2sDepd(task, filter).forEach(function(depd) {
      var currentBegin, earlist, entry, ok;
      currentBegin = new Time(depd.data.beginning);
      if (!currentBegin.earlierThan(newEnd)) {
        return;
      }
      entry = {
        mode,
        task: depd,
        newBegin: newEnd
      };
      if (mode === 'travel' || isMilestone(depd)) {
        entry.newEnd = taskEndByBeginDiff(depd, entry.newBegin);
      } else {
        ({ok, earlist} = checkEarlistTaskEnd(depd, entry.newBegin));
        if (!ok) {
          entry.newEnd = earlist;
        }
      }
      return entries.push(entry);
    });
    return entries;
  };

  collectTreeLeafForwardBeginResources = function(task, newBegin) {
    var belongsToTask, depdEntries, leafResources, leafsWithEarlierBegin, notBelongsToTask, treeDownNodes;
    [depdEntries, leafResources] = [[], []];
    treeDownNodes = descendants(task);
    belongsToTask = function(t) {
      return treeDownNodes.includes(t);
    };
    notBelongsToTask = function(t) {
      return !belongsToTask(t);
    };
    leafsWithEarlierBegin = treeDownNodes.filter(function(n) {
      return new Time(n.data.beginning).earlierThan(newBegin) && hasNoTaskChildren(n);
    });
    leafsWithEarlierBegin.concat(task).forEach(function(leaf) {
      var earlist, leafResource, ok;
      leafResource = {
        task: leaf,
        beginning: newBegin
      };
      ({ok, earlist} = checkEarlistTaskEnd(leaf, newBegin));
      if (!ok) {
        leafResource.end = earlist;
      }
      if (isMilestone(leaf)) {
        leafResource.end = newBegin;
      }
      leafResources.push(leafResource);
      depdEntries = depdEntries.concat(createS2SDepdEntries(leaf, newBegin, belongsToTask, 'flex'), createS2FDepdEntries(leaf, newBegin, belongsToTask, 'flex'), createS2SDepdEntries(leaf, newBegin, notBelongsToTask), createS2FDepdEntries(leaf, newBegin, notBelongsToTask));
      if (leafResource.end) {
        return depdEntries = depdEntries.concat(createF2FDepdEntries(leaf, leafResource.end, belongsToTask, 'flex'), createF2SDepdEntries(leaf, leafResource.end, belongsToTask, 'flex'), createF2FDepdEntries(leaf, leafResource.end, notBelongsToTask), createF2SDepdEntries(leaf, leafResource.end, notBelongsToTask));
      }
    });
    return {
      depdEntries,
      leafs: leafsWithEarlierBegin.concat(task),
      leafResources
    };
  };

  collectTreeLeafForwardEndResources = function(task, newEnd) {
    var belongsToTask, depdEntries, leafResources, leafsWithSameEnd, notBelongsToTask, treeDownNodes;
    [depdEntries, leafResources] = [[], []];
    treeDownNodes = descendants(task);
    belongsToTask = function(t) {
      return treeDownNodes.includes(t);
    };
    notBelongsToTask = function(t) {
      return !belongsToTask(t);
    };
    leafsWithSameEnd = treeDownNodes.filter(function(n) {
      return new Time(n.data.end).equals(task.data.end) && hasNoTaskChildren(n);
    });
    leafsWithSameEnd.concat(task).forEach(function(leaf) {
      var leafResource;
      leafResource = {
        task: leaf,
        end: newEnd
      };
      if (isMilestone(leaf)) {
        leafResource.beginning = newEnd;
      }
      leafResources.push(leafResource);
      if (leafResource.beginning) {
        depdEntries = depdEntries.concat(createS2SDepdEntries(leaf, leafResource.beginning, belongsToTask, 'flex'), createS2FDepdEntries(leaf, leafResource.beginning, belongsToTask, 'flex'), createS2SDepdEntries(leaf, leafResource.beginning, notBelongsToTask), createS2FDepdEntries(leaf, leafResource.beginning, notBelongsToTask));
      }
      return depdEntries = depdEntries.concat(createF2FDepdEntries(leaf, newEnd, belongsToTask, 'flex'), createF2SDepdEntries(leaf, newEnd, belongsToTask, 'flex'), createF2FDepdEntries(leaf, newEnd, notBelongsToTask), createF2SDepdEntries(leaf, newEnd, notBelongsToTask));
    });
    return {
      depdEntries,
      leafs: leafsWithSameEnd.concat(task),
      leafResources
    };
  };

  checkEarlistTreeBegin = function(task, newBegin, mode = 'flex') {
    var affectedTreeDownNodes, affectedTreeUpNodes, earlist, f2fDepcEnds, f2sDepcEnds, limitions, notBelongsToTask, ok, s2fDepcBegins, s2sDepcBegins;
    [earlist, ok] = [null, true];
    [f2sDepcEnds, s2sDepcBegins, f2fDepcEnds, s2fDepcBegins] = [[], [], [], []];
    affectedTreeDownNodes = descendants(task, function(n) {
      return new Time(n.data.beginning).equals(task.data.beginning);
    });
    affectedTreeUpNodes = ancestors(task).filter(function(n) {
      return new Time(n.data.beginning).laterThan(newBegin);
    });
    notBelongsToTask = function(t) {
      return !affectedTreeDownNodes.includes(t);
    };
    affectedTreeDownNodes.concat(task, affectedTreeUpNodes).forEach(function(n) {
      var d, i, j, k, l, len, len1, len2, len3, ref, ref1, ref2, ref3, results;
      ref = f2sDeps(n, notBelongsToTask);
      for (i = 0, len = ref.length; i < len; i++) {
        d = ref[i];
        f2sDepcEnds.push(d.data.end);
      }
      ref1 = s2sDeps(n, notBelongsToTask);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        d = ref1[j];
        s2sDepcBegins.push(d.data.beginning);
      }
      if (!isMilestone(n)) {
        return;
      }
      ref2 = f2fDeps(n, notBelongsToTask);
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        d = ref2[k];
        f2fDepcEnds.push(d.data.end);
      }
      ref3 = s2fDeps(n, notBelongsToTask);
      results = [];
      for (l = 0, len3 = ref3.length; l < len3; l++) {
        d = ref3[l];
        results.push(s2fDepcBegins.push(d.data.beginning));
      }
      return results;
    });
    limitions = [].concat(f2sDepcEnds, s2sDepcBegins, f2fDepcEnds, s2fDepcBegins);
    if (!limitions.length) {
      return {earlist, ok};
    }
    earlist = Time.latest(...limitions);
    ok = !earlist.laterThan(newBegin);
    return {earlist, ok};
  };

  checkEarlistTreeEnd = function(task, newEnd, mode = 'flex') {
    var affectedTreeDownNodes, affectedTreeUpNodes, earlist, earlistTaskEnds, f2fDepcEnds, f2sDepcEnds, limitions, notBelongsToTask, ok, s2fDepcBegins, s2sDepcBegins;
    [earlist, ok] = [null, true];
    [f2fDepcEnds, s2fDepcBegins, earlistTaskEnds] = [[], [], []];
    [f2sDepcEnds, s2sDepcBegins] = [[], []];
    affectedTreeDownNodes = descendants(task, function(n) {
      return new Time(n.data.end).laterThan(newEnd);
    });
    affectedTreeUpNodes = ancestors(task).filter(function(n) {
      var childrenWithSameOrLaterEnd;
      childrenWithSameOrLaterEnd = children(n, function(c) {
        return !new Time(c.data.end).earlierThan(task.data.end);
      });
      return childrenWithSameOrLaterEnd.length === 1;
    });
    notBelongsToTask = function(t) {
      return !affectedTreeDownNodes.includes(t);
    };
    affectedTreeDownNodes.concat(task, affectedTreeUpNodes).forEach(function(n) {
      var d, i, j, k, l, len, len1, len2, len3, ref, ref1, ref2, ref3, results;
      if (mode === 'flex' && isTask$1(n)) {
        earlistTaskEnds.push(earlistTaskEnd(n, n.data.beginning));
      }
      ref = s2fDeps(n, notBelongsToTask);
      for (i = 0, len = ref.length; i < len; i++) {
        d = ref[i];
        s2fDepcBegins.push(d.data.beginning);
      }
      ref1 = f2fDeps(n, notBelongsToTask);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        d = ref1[j];
        f2fDepcEnds.push(d.data.end);
      }
      if (!isMilestone(n)) {
        return;
      }
      ref2 = s2sDeps(n, notBelongsToTask);
      for (k = 0, len2 = ref2.length; k < len2; k++) {
        d = ref2[k];
        s2sDepcBegins.push(d.data.beginning);
      }
      ref3 = f2sDeps(n, notBelongsToTask);
      results = [];
      for (l = 0, len3 = ref3.length; l < len3; l++) {
        d = ref3[l];
        results.push(f2sDepcEnds.push(d.data.end));
      }
      return results;
    });
    limitions = [].concat(f2fDepcEnds, s2fDepcBegins, earlistTaskEnds, f2sDepcEnds, s2sDepcBegins);
    if (!limitions.length) {
      return {earlist, ok};
    }
    earlist = Time.latest(...limitions);
    ok = !earlist.laterThan(newEnd);
    return {earlist, ok};
  };

  collectTreeLeafBackwardBeginResources = function(task, newBegin) {
    var leafResources, leafsWithSameBegin, treeDownNodes;
    leafResources = [];
    treeDownNodes = descendants(task);
    leafsWithSameBegin = treeDownNodes.filter(function(n) {
      return new Time(n.data.beginning).equals(task.data.beginning) && hasNoTaskChildren(n);
    });
    leafsWithSameBegin.concat(task).forEach(function(leaf) {
      var leafResource;
      leafResource = {
        task: leaf,
        beginning: newBegin
      };
      if (isMilestone(leaf)) {
        leafResource.end = newBegin;
      }
      return leafResources.push(leafResource);
    });
    return {
      leafs: leafsWithSameBegin.concat(task),
      leafResources
    };
  };

  collectTreeLeafBackwardEndResources = function(task, newEnd) {
    var leafResources, leafsWithLaterEnd, treeDownNodes;
    leafResources = [];
    treeDownNodes = descendants(task);
    leafsWithLaterEnd = treeDownNodes.filter(function(n) {
      return new Time(n.data.end).laterThan(newEnd) && hasNoTaskChildren(n);
    });
    leafsWithLaterEnd.concat(task).forEach(function(leaf) {
      var leafResource;
      leafResource = {
        task: leaf,
        end: newEnd
      };
      if (isMilestone(leaf)) {
        leafResource.beginning = newEnd;
      }
      return leafResources.push(leafResource);
    });
    return {
      leafs: leafsWithLaterEnd.concat(task),
      leafResources
    };
  };

  collectTreeDownTravelResources = function(task, newBegin, newEnd) {
    var beginDiff, depdEntries, diff, endDiff, notBelongsToTask, resources, treeDownNodes;
    [depdEntries, resources] = [[], []];
    if (newBegin) {
      beginDiff = new Time(task.data.beginning).to(newBegin).seconds;
    }
    if (newEnd) {
      endDiff = new Time(task.data.end).to(newEnd).seconds;
    }
    if ((beginDiff != null) && (endDiff != null)) {
      diff = Math.max(beginDiff, endDiff);
    }
    if (diff == null) {
      diff = beginDiff || endDiff;
    }
    treeDownNodes = descendants(task);
    notBelongsToTask = function(t) {
      return !treeDownNodes.includes(t);
    };
    treeDownNodes.concat(task).forEach(function(instance) {
      var instanceNewBegin, instanceNewEnd, instanceOldBegin, instanceOldEnd;
      instanceOldBegin = new Time(instance.data.beginning);
      instanceOldEnd = new Time(instance.data.end);
      instanceNewBegin = instanceOldBegin.calcSeconds(diff);
      instanceNewEnd = instanceOldEnd.calcSeconds(diff);
      resources.push({
        task: instance,
        beginning: instanceNewBegin,
        end: instanceNewEnd
      });
      if (instanceNewBegin.laterThan(instanceOldBegin)) {
        depdEntries = depdEntries.concat(createS2SDepdEntries(instance, instanceNewBegin, notBelongsToTask), createS2FDepdEntries(instance, instanceNewBegin, notBelongsToTask));
      }
      if (instanceNewEnd.laterThan(instanceOldEnd)) {
        return depdEntries = depdEntries.concat(createF2FDepdEntries(instance, instanceNewEnd, notBelongsToTask), createF2SDepdEntries(instance, instanceNewEnd, notBelongsToTask));
      }
    });
    return {depdEntries, resources};
  };

  addUniqueResource = function(resources = [], ...newResources) {
    return newResources.forEach(function(resource) {
      var existed, newB, newDeps, newE, newResource, oldB, oldE, task;
      [task, newB, newE] = [resource.task, resource.beginning, resource.end];
      newDeps = resource.dependencies;
      if (existed = resources.find(function(r) {
        return r.task === task;
      })) {
        [oldB, oldE] = [existed.beginning, existed.end];
        if (newB) {
          newB = new Time(newB);
          if (!oldB || newB.laterThan(oldB)) {
            existed.beginning = newB.toString();
          }
        }
        if (newE) {
          newE = new Time(newE);
          if (!oldE || newE.laterThan(oldE)) {
            existed.end = newE.toString();
          }
        }
        if (newDeps) {
          return existed.dependencies = newDeps;
        }
      } else {
        newResource = {task};
        if (newB) {
          newResource.beginning = new Time(newB).toString();
        }
        if (newE) {
          newResource.end = new Time(newE).toString();
        }
        if (newDeps) {
          newResource.dependencies = newDeps;
        }
        return resources.push(newResource);
      }
    });
  };

  propagateResources = function(resources = [], targets = [], childFilter, mode) {
    var depdEntries;
    depdEntries = [];
    targets.forEach(function(task) {
      return desc(...ancestors(task)).some(function(ancestor) {
        var ancestorResource, beginIsCorrect, childTasks, childrenBegins, childrenEnds, correctBegin, correctEnd, dependencies, depsChanged, endIsCorrect, newF2FDeps, newS2FDeps;
        if (!(childTasks = children(ancestor, childFilter)).length) {
          return true;
        }
        [childrenBegins, childrenEnds] = [[], []];
        childTasks.forEach(function(child) {
          var childResource;
          childResource = resources.find(function(p) {
            return p.task === child;
          });
          childrenBegins.push((childResource != null ? childResource.beginning : void 0) || child.data.beginning);
          return childrenEnds.push((childResource != null ? childResource.end : void 0) || child.data.end);
        });
        correctBegin = Time.earlist(...childrenBegins);
        correctEnd = Time.latest(...childrenEnds);
        beginIsCorrect = correctBegin.equals(ancestor.data.beginning);
        endIsCorrect = correctEnd.equals(ancestor.data.end);
        if (hasNoTaskChildren(ancestor)) {
          beginIsCorrect || (beginIsCorrect = correctBegin.laterThan(ancestor.data.beginning));
          endIsCorrect || (endIsCorrect = correctEnd.earlierThan(ancestor.data.end));
        }
        if (beginIsCorrect && endIsCorrect) {
          return true;
        }
        ancestorResource = {
          task: ancestor
        };
        if (!beginIsCorrect) {
          ancestorResource.beginning = correctBegin;
        }
        if (!endIsCorrect) {
          ancestorResource.end = correctEnd;
        }
        if (mode === 'destroy' && !endIsCorrect) {
          dependencies = JSON.parse(JSON.stringify(ancestor.data.dependencies));
          newS2FDeps = joinDeps(s2fDeps(ancestor, function(d) {
            return !correctEnd.earlierThan(d.data.beginning);
          }).map(function(d) {
            return d.data.wbs;
          }));
          depsChanged = newS2FDeps !== dependencies.startToFinish;
          dependencies.startToFinish = newS2FDeps;
          newF2FDeps = joinDeps(f2fDeps(ancestor, function(d) {
            return !correctEnd.earlierThan(d.data.end);
          }).map(function(d) {
            return d.data.wbs;
          }));
          depsChanged || (depsChanged = newF2FDeps !== dependencies.finishToFinish);
          dependencies.finishToFinish = newF2FDeps;
          if (depsChanged) {
            ancestorResource.dependencies = dependencies;
          }
        }
        addUniqueResource(resources, ancestorResource);
        if (correctBegin.laterThan(ancestor.data.beginning)) {
          depdEntries = depdEntries.concat(createS2SDepdEntries(ancestor, correctBegin), createS2FDepdEntries(ancestor, correctBegin));
        }
        if (correctEnd.laterThan(ancestor.data.end)) {
          depdEntries = depdEntries.concat(createF2FDepdEntries(ancestor, correctEnd), createF2SDepdEntries(ancestor, correctEnd));
        }
        return false;
      });
    });
    return {depdEntries};
  };

  descResources = function(resources = []) {
    var descTasks, sortedResources;
    if (!(resources.length > 1)) {
      return resources;
    }
    sortedResources = [];
    descTasks = desc(...resources.map(function(resource) {
      return resource.task;
    }));
    descTasks.forEach(function(task) {
      var resource;
      resource = resources.find(function(r) {
        return r.task === task;
      });
      return sortedResources.push(resource);
    });
    return sortedResources;
  };

  collectResources = function(entryTask, newVals = {}, mode = 'flex') {
    var collected, depdEntries, earlist, entries, entry, fit, leafResources, leafs, newBegin, newEnd, ok, resources, task, uniqueResources;
    uniqueResources = [];
    entries = [
      Object.assign({
        mode,
        task: entryTask
      },
      newVals)
    ];
    ({task, newBegin, newEnd} = entries[0]);
    if (newBegin && mode !== 'destroy') {
      ({ok, earlist} = checkEarlistTreeBegin(task, newBegin, mode));
      if (!ok) {
        entries[0].newBegin = earlist;
      }
    }
    if (newEnd && mode !== 'destroy') {
      ({ok, earlist} = checkEarlistTreeEnd(task, newEnd, mode));
      if (!ok) {
        entries[0].newEnd = earlist;
      }
    }
    while (entry = entries.shift()) {
      ({mode, task, newBegin, newEnd} = entry);
      if (mode === 'destroy') {
        fit = function(child) {
          return child !== task;
        };
        ({depdEntries} = propagateResources(uniqueResources, [task], fit, 'destroy'));
        if (depdEntries != null ? depdEntries.length : void 0) {
          entries = entries.concat(depdEntries);
        }
      } else if (mode === 'travel') {
        ({resources, depdEntries} = collectTreeDownTravelResources(task, newBegin, newEnd));
        addUniqueResource(uniqueResources, ...resources);
        if (depdEntries != null ? depdEntries.length : void 0) {
          entries = entries.concat(depdEntries);
        }
        ({depdEntries} = propagateResources(uniqueResources, [task], null));
        if (depdEntries != null ? depdEntries.length : void 0) {
          entries = entries.concat(depdEntries);
        }
      } else {
        if (newBegin) {
          if (new Time(newBegin).earlierThan(task.data.beginning)) {
            collected = collectTreeLeafBackwardBeginResources(task, newBegin);
          } else {
            collected = collectTreeLeafForwardBeginResources(task, newBegin);
          }
          ({leafs, leafResources, depdEntries} = collected);
          addUniqueResource(uniqueResources, ...leafResources);
          if (depdEntries != null ? depdEntries.length : void 0) {
            entries = entries.concat(depdEntries);
          }
          ({depdEntries} = propagateResources(uniqueResources, leafs, null));
          if (depdEntries != null ? depdEntries.length : void 0) {
            entries = entries.concat(depdEntries);
          }
        }
        if (newEnd) {
          if (new Time(newEnd).earlierThan(task.data.end)) {
            collected = collectTreeLeafBackwardEndResources(task, newEnd);
          } else {
            collected = collectTreeLeafForwardEndResources(task, newEnd);
          }
          ({leafs, leafResources, depdEntries} = collected);
          addUniqueResource(uniqueResources, ...leafResources);
          if (depdEntries != null ? depdEntries.length : void 0) {
            entries = entries.concat(depdEntries);
          }
          ({depdEntries} = propagateResources(uniqueResources, leafs, null));
          if (depdEntries != null ? depdEntries.length : void 0) {
            entries = entries.concat(depdEntries);
          }
        }
      }
    }
    return descResources(uniqueResources);
  };

  mergeOriginal = function(task, newVals = {}, _original = {}) {
    var merged, prop;
    merged = [];
    if (newVals && 'beginning' in newVals) {
      merged.push('beginning');
    }
    if (newVals && 'end' in newVals) {
      merged.push('end');
    }
    prop = merged.join(',');
    return Object.assign({
      target: task,
      prop
    }, _original);
  };

  beforeUpdateSchedule = function(task, newVals = {}, mode, _returnRes, _original = {}) {
    var isPrevented, original, resources;
    original = mergeOriginal(task, newVals, _original);
    resources = collectResources(task, {
      newBegin: newVals.beginning,
      newEnd: newVals.end
    }, mode);
    isPrevented = resources.some(function(resource) {
      var beginning, dependencies, detail, end;
      ({task, beginning, end, dependencies} = resource);
      detail = {};
      if (beginning && !new Time(beginning).equals(task.data.beginning)) {
        detail.beginning = {
          newVal: beginning,
          oldVal: task.data.beginning
        };
      }
      if (end && !new Time(end).equals(task.data.end)) {
        detail.end = {
          newVal: end,
          oldVal: task.data.end
        };
      }
      if (dependencies) {
        detail.dependencies = detail.predecessors = dependencies;
      }
      if (!Object.keys(detail).length) {
        return;
      }
      return triggerEvent(task, 'before-update', detail, original) === false;
    });
    if (!_returnRes) {
      return !isPrevented;
    }
    return {
      resources,
      triggered: !isPrevented
    };
  };

  touchSchedule = function(task, newVals = {}, mode, _resources, _original = {}) {
    var original, resources;
    original = mergeOriginal(task, newVals, _original);
    resources = _resources || collectResources(task, {
      newBegin: newVals.beginning,
      newEnd: newVals.end
    }, mode);
    return resources.forEach(function(resource) {
      var beginning, dependencies, end, newVal, oldVal, touchDetail, updateDetail;
      ({task, beginning, end, dependencies} = resource);
      [touchDetail, updateDetail] = [{}, null];
      if (newVal = beginning) {
        oldVal = task.data.beginning;
        touchDetail.beginning = {newVal, oldVal};
        if (!new Time(newVal).equals(oldVal)) {
          task.data.beginning = newVal;
          updateDetail || (updateDetail = {});
          updateDetail.beginning = {newVal, oldVal};
        }
      }
      if (newVal = end) {
        oldVal = task.data.end;
        touchDetail.end = {newVal, oldVal};
        if (!new Time(newVal).equals(oldVal)) {
          task.data.end = newVal;
          updateDetail || (updateDetail = {});
          updateDetail.end = {newVal, oldVal};
        }
      }
      if (mode === 'destroy' && (newVal = dependencies)) {
        oldVal = task.data.dependencies;
        touchDetail.dependencies = touchDetail.predecessors = {newVal, oldVal};
        task.data.dependencies = newVal;
        updateDetail || (updateDetail = newVal);
        updateDetail.dependencies = updateDetail.predecessors = {newVal, oldVal};
      }
      triggerEvent(task, 'after-touch', touchDetail, original);
      if (!updateDetail) {
        return;
      }
      return triggerEvent(task, 'after-update', updateDetail, original);
    });
  };

  tryUpdateSchedule = function(task, newVals = {}, mode = 'flex') {
    var resources, triggered;
    ({triggered, resources} = beforeUpdateSchedule(task, newVals, mode, true));
    if (!triggered) {
      resources = resources.map(function(r) {
        var resource;
        resource = {
          task: r.task
        };
        if (r.beginning) {
          resource.beginning = r.task.data.beginning;
        }
        if (r.end) {
          resource.end = r.task.data.end;
        }
        if (dependencies) {
          return resource.dependencies = r.task.data.dependencies;
        }
      });
    }
    touchSchedule(task, newVals, mode, resources);
    return triggered;
  };

  Task.prototype._beforeUpdateSchedule = function(newVals, mode, _returnRes, _original) {
    return beforeUpdateSchedule(this, newVals, mode, _returnRes, _original);
  };

  Task.prototype._touchSchedule = function(newVals, mode, _resources, _original) {
    return touchSchedule(this, newVals, mode, _resources, _original);
  };

  Task.prototype._tryUpdateSchedule = function(newVals, mode) {
    return tryUpdateSchedule(this, newVals, mode);
  };

  var beginning;

  beginning = function(task, val) {
    var beginnings;
    mustExist(task);
    if (!val) {
      if (!isRoot(task)) {
        return new Time(task.data.beginning);
      }
      beginnings = children(task).map(function(c) {
        return c.data.beginning;
      });
      return Time.earlist(...beginnings);
    }
    if (isRoot(task)) {
      return;
    }
    return tryUpdateSchedule(task, {
      beginning: new Time(val)
    }, 'flex');
  };

  Task.prototype.beginning = function(val) {
    if (!val) {
      return beginning(this, val);
    }
    this._pushUndoState(() => {
      return beginning(this, val);
    });
    return this;
  };

  var actions, can, canBeDestroied, canBeFolded, canBePicked, canBeUpdated, canCreateMilestone, canCreateTask, canDestroyDescendants, canSwitchState;

  can = function(task, action, auth) {
    var detail, isActionEnabled, newVal, oldVal, operations;
    mustExist(task);
    operations = isRoot(task) ? task.data.actions : task.operations;
    isActionEnabled = operations.includes(action);
    if (auth == null) {
      return isActionEnabled;
    }
    if (auth) {
      if (isActionEnabled) {
        return;
      }
      if (isMilestone(task) && invalidMilestoneActions.includes(action)) {
        return;
      }
      oldVal = operations.slice();
      operations.push(action);
      newVal = operations.slice();
    } else {
      if (!isActionEnabled) {
        return;
      }
      oldVal = operations.slice();
      operations.splice(operations.indexOf(action), 1);
      newVal = operations.slice();
    }
    if (!(oldVal && newVal)) {
      return task;
    }
    detail = {
      actions: {newVal, oldVal}
    };
    // It's not necessary to implement the before-update event,
    // because a tasks's actions cannot controlled by users.
    triggerEvent(task, 'after-touch', detail);
    triggerEvent(task, 'after-update', detail);
    return task;
  };

  actions = function(task, ...acts) {
    var act, i, len, operations, ref;
    mustExist(task);
    operations = isRoot(task) ? task.data.actions : task.operations;
    if (!acts.length) {
      return operations.slice();
    }
    ref = operations.concat(acts);
    for (i = 0, len = ref.length; i < len; i++) {
      act = ref[i];
      can(task, act, acts.includes(act));
    }
    return task;
  };

  canBePicked = function(task, auth) {
    return can(task, 'pick', auth);
  };

  canBeFolded = function(task, auth) {
    return can(task, 'fold', auth);
  };

  canCreateTask = function(task, auth) {
    return can(task, 'createTask', auth);
  };

  canCreateMilestone = function(task, auth) {
    return can(task, 'createMilestone', auth);
  };

  canBeUpdated = function(task, auth) {
    return can(task, 'update', auth);
  };

  canBeDestroied = function(task, auth) {
    return can(task, 'destroy', auth);
  };

  canDestroyDescendants = function(task, auth) {
    return can(task, 'destroyDescendants', auth);
  };

  canSwitchState = function(task, auth) {
    return can(task, 'switchState', auth);
  };

  Task.prototype.can = function(action, auth) {
    var result;
    result = can(this, action, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.actions = function(...acts) {
    var result;
    result = actions(this, ...acts);
    if (result instanceof Array) {
      return result;
    }
    return this;
  };

  Task.prototype.canBePicked = function(auth) {
    var result;
    result = canBePicked(this, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.canBeFolded = function(auth) {
    var result;
    result = canBeFolded(this, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.canCreateTask = function(auth) {
    var result;
    result = canCreateTask(this, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.canCreateMilestone = function(auth) {
    var result;
    result = canCreateMilestone(this, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.canBeUpdated = function(auth) {
    var result;
    result = canBeUpdated(this, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.canBeDestroied = function(auth) {
    var result;
    result = canBeDestroied(this, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.canDestroyDescendants = function(auth) {
    var result;
    result = canDestroyDescendants(this, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.canSwitchState = function(auth) {
    var result;
    result = canSwitchState(this, auth);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  var create$1, createHistoricalTask, createRoot, createTasks;

  createRoot = function(settings = {}) {
    delete settings.wbs;
    return new Task(settings);
  };

  createTasks = function(existed, ...datas) {
    var created, withWbs, withoutWbs;
    mustExist(existed);
    [withWbs, withoutWbs, created] = [[], [], []];
    datas.forEach(function(data) {
      data.rootId = existed.rootId;
      if ('wbs' in data) {
        return withWbs.push(data);
      }
      return withoutWbs.push(data);
    });
    withWbs.sort(function(a, b) {
      return compareWbs(a.wbs, b.wbs);
    }).forEach(function(data) {
      return created.push(new Task(data));
    });
    withoutWbs.forEach(function(data) {
      var lastC;
      if (lastC = lastChild(existed)) {
        data.wbs = nextWbs(lastC.data.wbs);
      } else {
        data.wbs = firstChildWbs(existed.data.wbs);
      }
      return created.push(new Task(data));
    });
    return created;
  };

  createHistoricalTask = function(...datas) {
    var data, tasks;
    tasks = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = datas.length; i < len; i++) {
        data = datas[i];
        results.push(new Task(data, {
          source: 'history'
        }));
      }
      return results;
    })();
    return setTimeout(function() {
      return tasks.forEach(function(task) {
        return triggerEvent(task, 'after-create');
      });
    });
  };

  create$1 = function(settings = {}, ...datas) {
    var rootTask;
    delete settings.wbs;
    rootTask = createRoot(settings);
    createTasks(rootTask, ...datas);
    return rootTask;
  };

  Task.create = create$1;

  Task.prototype.create = function(...datas) {
    var result;
    result = [];
    this._pushUndoState(() => {
      return result = createTasks(this, ...datas);
    });
    return result;
  };

  var fold;

  fold = function(task, isFolded = true) {
    var foldedAncestors;
    mustExist(task);
    if (!(isFolded = Boolean(isFolded))) {
      foldedAncestors = ancestors(task, function(t) {
        return t.isFolded;
      });
      if (foldedAncestors.length) {
        return fold(asc(...foldedAncestors)[0], isFolded);
      }
    }
    return asc(...descendants(task).concat(task)).forEach(function(t) {
      var isFoldedDetail, isHiddenDetail, oldFolded, oldHidden, touchDetail;
      [oldFolded, oldHidden] = [Boolean(t.isFolded), Boolean(t.isHidden)];
      t.isFolded = children(t).length ? isFolded : false;
      if (t === task) {
        t.isHidden = isFolded ? Boolean(t.isHidden) : false;
      } else {
        t.isHidden = Boolean(parent(t, true).isFolded);
      }
      isFoldedDetail = {
        isFolded: {
          newVal: t.isFolded,
          oldVal: oldFolded
        }
      };
      isHiddenDetail = {
        isHidden: {
          newVal: t.isHidden,
          oldVal: oldHidden
        }
      };
      touchDetail = Object.assign({}, isFoldedDetail, isHiddenDetail);
      // It's not necessary to implement the before-update event,
      // because the isFolded property has noting to do
      // with a task's business data.
      triggerEvent(t, 'after-touch', touchDetail);
      if (oldFolded !== t.isFolded) {
        triggerEvent(t, 'after-update', isFoldedDetail);
      }
      if (oldHidden !== t.isHidden) {
        return triggerEvent(t, 'after-update', isHiddenDetail);
      }
    });
  };

  Task.prototype.fold = function(isFolded) {
    fold(this, isFolded);
    return this;
  };

  var destroy$1, destroyHistoricalTask, destroyRoot, riseNextSiblings;

  riseNextSiblings = function(task) {
    var newWbses, oldWbses, taskWbsArr;
    taskWbsArr = splitWbs(task.data.wbs);
    [oldWbses, newWbses] = [[], []];
    nextSiblings(task).forEach(function(c) {
      return descendants(c).concat(c).forEach(function(t) {
        var detail, newVal, oldVal, wbsArr;
        oldWbses.push(oldVal = t.data.wbs);
        wbsArr = splitWbs(t.data.wbs);
        wbsArr[taskWbsArr.length - 1] -= 1;
        newVal = t.data.wbs = joinWbs(wbsArr);
        detail = {
          wbs: {oldVal, newVal}
        };
        triggerEvent(t, 'after-touch', detail);
        triggerEvent(t, 'after-update', detail);
        return newWbses.push(t.data.wbs);
      });
    });
    return root(task).tasks.forEach(function(t) {
      var ref, results, shouldUpdate, type, val, wbses;
      ref = t.data.dependencies;
      results = [];
      for (type in ref) {
        val = ref[type];
        [shouldUpdate, wbses] = [false, splitDeps(val)];
        wbses.forEach(function(wbs, index) {
          if (!oldWbses.includes(wbs)) {
            return;
          }
          wbses[index] = newWbses[oldWbses.indexOf(wbs)];
          return shouldUpdate = true;
        });
        if (shouldUpdate) {
          results.push(touchDeps(t, type, wbses, []));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
  };

  destroyRoot = function(rootTask) {
    var k, v;
    mustBeRoot(rootTask);
    delete Task.roots[rootTask.uid];
    for (k in rootTask) {
      v = rootTask[k];
      rootTask[k] = null;
    }
    return rootTask;
  };

  destroy$1 = function(existed, ...tasks) {
    var all, destroied;
    mustExist(existed);
    if (!tasks.length) {
      if (isRoot(existed)) {
        return destroyRoot(existed);
      }
      tasks = [existed];
    }
    [destroied, all] = [[], root(existed).tasks];
    desc(...tasks).forEach(function(task) {
      var depsResources, isPrevented, resources, scheduleResources, taskAncestors, treeDownNodes, treeDownWbses, triggered;
      treeDownNodes = descendants(task).concat(task).filter(function(t) {
        return all.includes(t);
      });
      if (!treeDownNodes.length) {
        return;
      }
      treeDownNodes = desc(...treeDownNodes);
      // Checking if any before-destroy event of
      // current task or its descendants is prevented
      isPrevented = treeDownNodes.some(function(node) {
        return triggerEvent(node, 'before-destroy') === false;
      });
      if (isPrevented) {
        return;
      }
      // Checking if any ancestors of current task need be rescheduled
      // and if any of the operations is prevented
      ({triggered, resources} = beforeUpdateSchedule(task, {}, 'destroy', true));
      [isPrevented, scheduleResources] = [!triggered, resources];
      if (isPrevented) {
        return;
      }
      // Checking if any existed task's dependencies property need be updated
      // and if any of the operations is prevented.
      depsResources = [];
      treeDownWbses = treeDownNodes.map(function(node) {
        return node.data.wbs;
      });
      isPrevented = all.some(function(node) {
        if (treeDownNodes.includes(node)) {
          return false;
        }
        return Object.keys(node.data.dependencies).some(function(type) {
          var depsWbsArr, filtered;
          depsWbsArr = depWbses(node, type);
          filtered = depsWbsArr.filter(function(w) {
            return !treeDownWbses.includes(w);
          });
          if (luda.arrayEqual(depsWbsArr, filtered)) {
            return false;
          }
          triggered = beforeUpdateDeps(node, type, filtered);
          // Collecting dependencies resources need be updated
          depsResources.push({
            task: node,
            type,
            newVals: filtered
          });
          return !triggered;
        });
      });
      if (isPrevented) {
        return;
      }
      // Executing destroy actions.
      touchSchedule(task, null, 'destroy', scheduleResources);
      depsResources.forEach(function(r) {
        return touchDeps(r.task, r.type, r.newVals, []);
      });
      riseNextSiblings(task);
      taskAncestors = desc(...ancestors(task));
      treeDownNodes.forEach(function(node) {
        triggerEvent(node, 'after-destroy');
        removeEvent(node);
        destroied.push(node);
        return all.splice(all.indexOf(node), 1);
      });
      return taskAncestors.forEach(function(a) {
        if (a.isFolded && children(a).length === 0) {
          return fold(a, false);
        }
      });
    });
    return destroied;
  };

  destroyHistoricalTask = function(...datas) {
    return datas.forEach(function(data) {
      var index, rootTask, task;
      rootTask = root(data);
      task = find(rootTask, data.uid);
      index = rootTask.tasks.indexOf(task);
      if (!(index >= 0)) {
        return;
      }
      triggerEvent(task, 'after-destroy');
      removeEvent(task);
      return rootTask.tasks.splice(index, 1);
    });
  };

  Task.prototype.destroy = function(...tasks) {
    var result;
    result = [];
    this._pushUndoState(() => {
      return result = destroy$1(this, ...tasks);
    });
    return result;
  };

  var end;

  end = function(task, val) {
    var ends;
    mustExist(task);
    if (!val) {
      if (!isRoot(task)) {
        return new Time(task.data.end);
      }
      ends = children(task).map(function(c) {
        return c.data.end;
      });
      return Time.latest(...ends);
    }
    if (isRoot(task)) {
      return;
    }
    return tryUpdateSchedule(task, {
      end: new Time(val)
    }, 'flex');
  };

  Task.prototype.end = function(val) {
    if (!val) {
      return end(this, val);
    }
    this._pushUndoState(() => {
      return end(this, val);
    });
    return this;
  };

  var calcSecs, devideSecs, duration, extractInclusions, mergeExclusions;

  calcSecs = function(taskBegin, taskEnd, exclusions = []) {
    var durationObj, durationSecs;
    durationObj = taskEnd.since(taskBegin);
    durationSecs = durationObj.seconds;
    if (!(exclusions && exclusions.length)) {
      return durationSecs;
    }
    exclusions.some(function(t) {
      var tBegin, tEnd;
      [tEnd, tBegin] = [new Time(t.end), new Time(t.beginning)];
      if (tBegin.laterThan(taskEnd) || tEnd.earlierThan(taskBegin)) {
        return;
      }
      if (tEnd.laterThan(taskEnd)) {
        tEnd = taskEnd;
      }
      if (tBegin.earlierThan(taskBegin)) {
        tBegin = taskBegin;
      }
      durationSecs -= tEnd.since(tBegin).seconds;
      if (durationSecs < 0) {
        durationSecs = 0;
      }
      return durationSecs === 0;
    });
    return durationSecs;
  };

  mergeExclusions = function(exclusions = []) {
    var mergedExclusions, rBegin, rEnd, range;
    [exclusions, mergedExclusions] = [exclusions.slice(), []];
    while (exclusions.length) {
      range = exclusions.shift();
      [rEnd, rBegin] = [new Time(range.end), new Time(range.beginning)];
      exclusions = exclusions.filter(function(t) {
        var tBegin, tEnd;
        [tEnd, tBegin] = [new Time(t.end), new Time(t.beginning)];
        if ((tBegin.laterThan(rEnd)) || (tEnd.earlierThan(rBegin))) {
          return true;
        }
        [rEnd, rBegin] = [Time.latest(tEnd, rEnd), Time.earlist(tBegin, rBegin)];
        return false;
      });
      mergedExclusions.push({
        beginning: rBegin,
        end: rEnd
      });
    }
    return mergedExclusions;
  };

  extractInclusions = function(exclusions = [], inclusions = []) {
    var extracted, rB, rE, range;
    while (inclusions.length) {
      [range, extracted] = [inclusions.shift(), []];
      [rE, rB] = [new Time(range.end), new Time(range.beginning)];
      exclusions = exclusions.filter(function(t) {
        var tB, tE;
        [tE, tB] = [new Time(t.end), new Time(t.beginning)];
        if ((!tB.earlierThan(rE)) || (!tE.laterThan(rB))) {
          return true;
        }
        if ((!tB.earlierThan(rB)) && (!tE.laterThan(rE))) {
          return false;
        }
        if ((tB.earlierThan(rB)) && (!tE.laterThan(rE))) {
          return t.end = rB;
        }
        if ((tE.laterThan(rE)) && (!tB.earlierThan(rB))) {
          return t.beginning = rE;
        }
        extracted.push({
          beginning: tB,
          end: rB
        });
        extracted.push({
          beginning: rE,
          end: tE
        });
        return false;
      });
      exclusions = exclusions.concat(extracted);
    }
    return exclusions;
  };

  devideSecs = function(seconds) {
    var days, hours, minutes, months, weeks, years;
    minutes = seconds / 60;
    hours = minutes / 60;
    days = hours / 24;
    weeks = days / 7;
    months = days / 30;
    years = days / 365;
    return {years, months, weeks, days, hours, minutes, seconds};
  };

  duration = function(task, secs, exceptExclusions = true) {
    var effectedSecs, exclusions, taskBegin, taskEnd, weekends;
    mustExist(task);
    [taskEnd, taskBegin] = [end(task), beginning(task)];
    if (exceptExclusions) {
      exclusions = root(task).data.exclusions.slice();
    }
    if (exceptExclusions && root(task).data.excludeWeekends) {
      weekends = Time.devideByDay(taskBegin, taskEnd).filter(function(d) {
        return d.beginning.isWeekend();
      });
      exclusions = exclusions.concat(weekends);
    }
    exclusions = extractInclusions(exclusions, root(task).data.inclusions.slice());
    exclusions = mergeExclusions(exclusions);
    if (!secs) {
      return devideSecs(calcSecs(taskBegin, taskEnd, exclusions));
    }
    if (isRoot(task)) {
      return task;
    }
    if (!Number.isInteger(secs && secs > 0)) {
      throw new Error("secs must be a positive integer");
    }
    taskEnd = taskBegin.nextSecond(secs);
    effectedSecs = calcSecs(taskBegin, taskEnd, exclusions);
    while (secs !== effectedSecs) {
      taskEnd = taskEnd.nextSecond(secs - effectedSecs);
      effectedSecs = calcSecs(taskBegin, taskEnd, exclusions);
    }
    end(task, taskEnd);
    return devideSecs(secs);
  };

  Task.prototype.duration = function(secs, exceptExclusions = true) {
    if (secs == null) {
      return duration(this, secs, exceptExclusions);
    }
    this._pushUndoState(() => {
      return duration(this, secs, exceptExclusions);
    });
    return this;
  };

  var pick, picked;

  pick = function(tasks = [], isPicked = true, cascaded = true) {
    var taskDescendants;
    if (!luda.isArray(tasks)) {
      tasks = [tasks];
    }
    if (cascaded) {
      taskDescendants = [];
      tasks.forEach(function(t) {
        return taskDescendants = taskDescendants.concat(descendants(t));
      });
      tasks = luda.unique(tasks.concat(taskDescendants));
    }
    return tasks.forEach(function(t) {
      var detail, newVal, oldVal;
      oldVal = Boolean(t.isPicked);
      newVal = t.isPicked = Boolean(isPicked);
      detail = {
        isPicked: {newVal, oldVal}
      };
      // It's not necessary to implement the before-update event,
      // because the isPicked property has noting to do
      // with a task's business data.
      triggerEvent(t, 'after-touch', detail);
      if (oldVal === newVal) {
        return;
      }
      triggerEvent(t, 'after-update', detail);
    });
  };

  picked = function(task) {
    mustExist(task);
    return descendants(task).filter(function(t) {
      return t.isPicked;
    });
  };

  Task.pick = pick;

  Task.prototype.pick = function(isPicked, cascaded) {
    pick(this, isPicked, cascaded);
    return this;
  };

  Task.prototype.picked = function() {
    return picked(this);
  };

  var readonly, readonlyProps;

  readonly = function(task, prop, isReadonly) {
    var detail, isPropReadonly, newVal, oldVal;
    mustExist(task);
    if (isRoot(task)) {
      if (isReadonly != null) {
        return;
      }
      return true;
    } else {
      isPropReadonly = task.readonlys.includes(prop);
      isPropReadonly || (isPropReadonly = !canBeUpdated(task));
      if (isReadonly == null) {
        return isPropReadonly;
      }
      if (isReadonly) {
        if (isPropReadonly) {
          return;
        }
        oldVal = task.readonlys.slice();
        task.readonlys.push(prop);
        if (prop === 'duration') {
          readonly(task, 'beginning', true);
          readonly(task, 'end', true);
        }
        if (readonly(task, 'beginning') && readonly(task, 'end')) {
          readonly(task, 'duration', true);
        }
        if (isMilestone(task)) {
          if (readonly(task, 'duration') || readonly(task, 'beginning') || readonly(task, 'end')) {
            readonly(task, 'duration', true);
          }
        }
        newVal = task.readonlys.slice();
      } else {
        if (!isPropReadonly) {
          return;
        }
        if (builtInProps.includes(prop)) {
          return;
        }
        oldVal = task.readonlys.slice();
        task.readonlys.splice(task.readonlys.indexOf(prop), 1);
        if (prop === 'duration') {
          readonly(task, 'beginning', false);
          readonly(task, 'end', false);
        }
        if (!readonly(task, 'beginning') || !readonly(task, 'end')) {
          readonly(task, 'duration', false);
        }
        if (isMilestone(task)) {
          if (!readonly(task, 'duration') || !readonly(task, 'beginning') || !readonly(task, 'end')) {
            readonly(task, 'duration', false);
          }
        }
        newVal = task.readonlys.slice();
      }
      if (!(oldVal && newVal)) {
        return task;
      }
      detail = {
        readonlyProps: {newVal, oldVal}
      };
      // It's not necessary to implement the before-update event,
      // because the readonly properties can not controlled by users.
      triggerEvent(task, 'after-touch', detail);
      triggerEvent(task, 'after-update', detail);
      return task;
    }
  };

  readonlyProps = function(task, ...props) {
    var i, len, prop, ref;
    mustExist(task);
    if (isRoot(task)) {
      if (props.length) {
        return;
      }
      return [];
    } else {
      if (!props.length) {
        return task.readonlys.slice();
      }
      ref = task.readonlys.concat(props);
      for (i = 0, len = ref.length; i < len; i++) {
        prop = ref[i];
        readonly(task, prop, props.includes(prop));
      }
      return task;
    }
  };

  Task.prototype.readonly = function(prop, isReadonly) {
    var result;
    result = readonly(this, prop, isReadonly);
    if (typeof result === 'boolean') {
      return result;
    }
    return this;
  };

  Task.prototype.readonlyProps = function(...props) {
    var result;
    result = readonlyProps(this, ...props);
    if (result instanceof Array) {
      return result;
    }
    return this;
  };

  var update, updateHistoricalTask, updateRoot, updateTask, updateTaskEnhancedProps;

  updateRoot = function(rootTask, data = {}) {
    mustBeRoot(rootTask);
    // for p in ['uid', 'rootId', 'wbs', 'tasks', 'events', 'created']
    //   delete data[p]
    throw new Error("Not implemmented");
  };

  updateTaskEnhancedProps = function(task, data = {}) {
    var added, currentDepds, currentDeps, depds, deps, newDepds, newDeps, ref, ref1, removed, type;
    if ('predecessors' in data || 'dependencies' in data) {
      ref = data.predecessors || data.dependencies;
      for (type in ref) {
        deps = ref[type];
        if (luda.isArray(deps)) {
          deps = joinDeps(deps);
        }
        newDeps = splitDeps(deps);
        currentDeps = splitDeps(task.data.dependencies[type]);
        added = newDeps.filter(function(wbs) {
          return !currentDeps.includes(wbs);
        });
        removed = currentDeps.filter(function(wbs) {
          return !newDeps.includes(wbs);
        });
        if (removed.length) {
          removeDeps(task, removed);
        }
        if (added.length) {
          addDeps(task, type, added);
        }
      }
    }
    if ('successors' in data) {
      ref1 = data.successors;
      for (type in ref1) {
        depds = ref1[type];
        if (luda.isArray(depds)) {
          depds = joinDeps(depds);
        }
        newDepds = splitDeps(depds);
        currentDepds = splitDeps(task.depended[type]);
        added = newDepds.filter(function(wbs) {
          return !currentDepds.includes(wbs);
        });
        removed = currentDepds.filter(function(wbs) {
          return !newDepds.includes(wbs);
        });
        if (removed.length) {
          removeDepd(task, removed);
        }
        if (added.length) {
          addDepd(task, type, added);
        }
      }
    }
    if ('beginning' in data) {
      beginning(task, data.beginning);
    }
    if ('end' in data) {
      end(task, data.end);
    }
    if ('duration' in data) {
      duration(task, data.duration);
    }
    if ('isPicked' in data) {
      pick(task, data.isPicked);
    }
    if ('isFolded' in data) {
      fold(task, data.isFolded);
    }
    if ('actions' in data) {
      actions(task, ...data.actions);
    }
    if ('readonlyProps' in data) {
      return readonlyProps(task, ...data.readonlyProps);
    }
  };

  updateTask = function(existed, ...datas) {
    var dataForExisted, updated, withUid, withoutUid;
    mustExist(existed);
    [withUid, withoutUid, dataForExisted, updated] = [[], [], {}, []];
    datas.forEach(function(data) {
      if ('uid' in data) {
        return withUid.push(data);
      }
      return Object.assign(dataForExisted, data);
    });
    if (Object.keys(dataForExisted).length) {
      dataForExisted.uid = existed.uid;
      withUid.push(dataForExisted);
    }
    withUid.sort(function(a, b) {
      return b.uid - a.uid;
    }).forEach(function(data) {
      var detail, isPrevented, j, k, key, len, len1, newVal, oldVal, p, results1, task;
      if (!(task = find(root(existed), data.uid))) {
        return;
      }
      updated.push(task);
      Object.keys(data).forEach(function(prop) {
        var newVal, newValDup, propTree, topLevelProp, value;
        propTree = prop.split('.');
        if (propTree.length === 1) {
          return;
        }
        [value, topLevelProp] = [data[prop], propTree[0]];
        if (topLevelProp === 'predecessors' || topLevelProp === 'dependencies') {
          newVal = JSON.parse(JSON.stringify(task.data.dependencies));
          newVal[propTree[1]] = value;
        } else if (topLevelProp === 'successors') {
          newVal = JSON.parse(JSON.stringify(task.depended));
          newVal[propTree[1]] = value;
        } else {
          newVal = newValDup = JSON.parse(JSON.stringify(task.data[topLevelProp] || {}));
          propTree.forEach(function(p, i) {
            if (i === 0) {
              return;
            }
            if (i !== propTree.length - 1) {
              return newVal = newValDup[p] || (newValDup[p] = {});
            }
            return newValDup[p] = value;
          });
        }
        data[topLevelProp] = newVal;
        return delete data[prop];
      });
      for (j = 0, len = builtInProps.length; j < len; j++) {
        p = builtInProps[j];
        delete data[p];
      }
      updateTaskEnhancedProps(task, data);
      for (k = 0, len1 = enhancedProps.length; k < len1; k++) {
        p = enhancedProps[k];
        delete data[p];
      }
      results1 = [];
      for (key in data) {
        newVal = data[key];
        oldVal = task.data[key];
        detail = {};
        detail[key] = {newVal, oldVal};
        // Custom properties are allowed to be changed in before-update event
        isPrevented = triggerEvent(task, 'before-update', detail, {
          target: task,
          prop: key
        }) === false;
        if (isPrevented) {
          detail[key].newVal = oldVal;
          results1.push(triggerEvent(task, 'after-touch', detail));
        } else {
          task.data[key] = detail[key].newVal;
          triggerEvent(task, 'after-touch', detail);
          if (detail[key].newVal !== oldVal) {
            results1.push(triggerEvent(task, 'after-update', detail));
          } else {
            results1.push(void 0);
          }
        }
      }
      return results1;
    });
    return updated;
  };

  updateHistoricalTask = function(...datas) {
    var results;
    results = datas.map(function(data) {
      var task, updated;
      data.data || (data.data = {});
      updated = {};
      task = find(root(data), data.uid);
      delete data.uid;
      delete data.rootId;
      Object.keys(data).forEach(function(key) {
        if (key === 'data') {
          return;
        }
        updated[key] = {
          oldVal: task[key],
          newVal: task[key] = data[key]
        };
        if (key !== 'depended') {
          return;
        }
        return updated.successors = updated[key];
      });
      Object.keys(data.data).forEach(function(key) {
        var ref, results1, type, val;
        updated[key] = {
          oldVal: task.data[key],
          newVal: task.data[key] = data.data[key]
        };
        if (key !== 'dependencies') {
          return;
        }
        updated.predecessors = updated[key];
        ref = data.data[key];
        results1 = [];
        for (type in ref) {
          val = ref[type];
          results1.push(updated[type] = {
            oldVal: updated[key].oldVal[type],
            newVal: updated[key].newVal[type]
          });
        }
        return results1;
      });
      return {task, updated};
    });
    return setTimeout(function() {
      return results.forEach(function(r) {
        triggerEvent(r.task, 'after-touch', r.updated);
        return triggerEvent(r.task, 'after-update', r.updated);
      });
    });
  };

  update = function(existed, ...datas) {
    if (isRoot(existed)) {
      return updateRoot(existed, ...datas);
    }
    return updateTask(existed, ...datas);
  };

  Task.prototype.update = function(...datas) {
    this._pushUndoState(() => {
      return update(this, ...datas);
    });
    return this;
  };

  var currentState, diffState, diffTask, history, popRedoState, popState, popUndoState, pushRedoState, pushState, pushUndoState, redo, stateEqual, undo;

  stateEqual = function(one, two) {
    var oneKeys, oneType, twoKeys, twoType;
    if (one === two) {
      return true;
    }
    oneType = Object.prototype.toString.call(one);
    twoType = Object.prototype.toString.call(two);
    if (oneType !== twoType) {
      return false;
    }
    if (oneType === '[object Object]') {
      [oneKeys, twoKeys] = [Object.keys(one), Object.keys(two)];
      if (oneKeys.length !== twoKeys.length) {
        return false;
      }
      return oneKeys.every(function(key) {
        return stateEqual(one[key], two[key]);
      });
    }
    if (oneType === '[object Array]') {
      if (one.length !== two.length) {
        return false;
      }
      if (luda.arrayEqual(one, two)) {
        return true;
      }
      [one, two] = [one.sort(), two.sort()];
      return one.every(function(oneE) {
        return two.some(function(twoE) {
          return stateEqual(oneE, twoE);
        });
      });
    }
    return Object.is(one, two);
  };

  currentState = function(task) {
    var state;
    mustExist(task);
    state = JSON.parse(JSON.stringify(asc(...root(task).tasks)));
    state.forEach(function(item) {
      return delete item.errors;
    });
    return state;
  };

  diffState = function(newState = [], oldState = []) {
    var isDiff, toCreate, toCreateUids, toDestroy, toDestroyUids, toUpdate;
    isDiff = false;
    [toCreateUids, toDestroyUids] = [[], []];
    [toDestroy, toCreate, toUpdate] = [[], [], []];
    oldState.forEach(function(task) {
      if (newState.find(function(item) {
        return item.uid === task.uid;
      })) {
        return;
      }
      toDestroyUids.push(task.uid);
      toDestroy.push(task);
      return isDiff = true;
    });
    newState.forEach(function(task) {
      if (oldState.find(function(item) {
        return item.uid === task.uid;
      })) {
        return;
      }
      toCreateUids.push(task.uid);
      toCreate.push(task);
      return isDiff = true;
    });
    newState.forEach(function(task) {
      var diffedTask, oldTask;
      if (toCreateUids.includes(task.uid)) {
        return;
      }
      if (toDestroyUids.includes(task.uid)) {
        return;
      }
      if (!(oldTask = oldState.find(function(item) {
        return item.uid === task.uid;
      }))) {
        return;
      }
      if (!(diffedTask = diffTask(task, oldTask))) {
        return;
      }
      toUpdate.push(diffedTask);
      return isDiff = true;
    });
    if (!isDiff) {
      return null;
    }
    return {
      destroy: toDestroy,
      create: toCreate,
      update: toUpdate
    };
  };

  diffTask = function(newTask, oldTask, _exclusionKeys = []) {
    var data, diffedTask, newKeys, oldKeys;
    diffedTask = null;
    [newKeys, oldKeys] = [Object.keys(newTask), Object.keys(oldTask)];
    newKeys.forEach(function(key) {
      var i;
      if (_exclusionKeys.includes(key)) {
        return;
      }
      if ((i = oldKeys.indexOf(key)) >= 0) {
        oldKeys.splice(i, 1);
      }
      if (stateEqual(newTask[key], oldTask[key])) {
        return;
      }
      diffedTask || (diffedTask = {});
      return diffedTask[key] = newTask[key];
    });
    oldKeys.forEach(function(key) {
      if (_exclusionKeys.includes(key)) {
        return;
      }
      diffedTask || (diffedTask = {});
      return diffedTask[key] = void 0;
    });
    if (_exclusionKeys.includes('data')) {
      return diffedTask;
    }
    if (diffedTask) {
      diffedTask.uid = newTask.uid;
      diffedTask.rootId = newTask.rootId;
    }
    if (!(data = diffTask(newTask.data, oldTask.data, ['data']))) {
      return diffedTask;
    }
    diffedTask || (diffedTask = {});
    diffedTask.data = data;
    return diffedTask;
  };

  popState = function(task, action = 'undo') {
    var rootTask, stack, state;
    mustExist(task);
    rootTask = root(task);
    stack = rootTask.stacks[action];
    if (!(state = stack.pop())) {
      return null;
    }
    state = JSON.parse(JSON.stringify(state));
    triggerEvent(rootTask, 'after-update-state-stack', {
      action,
      state,
      direction: 'pop'
    });
    triggerEvent(rootTask, 'after-pop-state-stack', {action, state});
    triggerEvent(rootTask, `after-pop-${action}-state-stack`, state);
    return state;
  };

  popUndoState = function(task) {
    return popState(task, 'undo');
  };

  popRedoState = function(task) {
    return popState(task, 'redo');
  };

  pushState = function(task, action = 'undo', _state) {
    var lastState, rootTask, shouldPush, stack, state;
    mustExist(task);
    rootTask = root(task);
    stack = rootTask.stacks[action];
    state = _state || currentState(task);
    lastState = stack[stack.length - 1];
    shouldPush = !lastState;
    shouldPush || (shouldPush = state.length !== lastState.length);
    shouldPush || (shouldPush = !stateEqual(state, lastState));
    if (!shouldPush) {
      return null;
    }
    if (stack.length >= rootTask.data.maxHistorySize) {
      stack.shift();
    }
    stack.push(state);
    triggerEvent(rootTask, 'after-update-state-stack', {
      action,
      state,
      direction: 'push'
    });
    triggerEvent(rootTask, 'after-push-state-stack', {action, state});
    triggerEvent(rootTask, `after-push-${action}-state-stack`, state);
    return state;
  };

  pushUndoState = function(task) {
    return pushState(task, 'undo');
  };

  pushRedoState = function(task) {
    return pushState(task, 'redo');
  };

  history = function(task, action = 'undo') {
    var actions, detail, lastState, rootTask, state;
    mustExist(task);
    if (!(lastState = popState(task, action))) {
      return;
    }
    state = currentState(task);
    actions = diffState(lastState, state);
    if (!actions) {
      return;
    }
    destroyHistoricalTask(...actions.destroy);
    createHistoricalTask(...actions.create);
    updateHistoricalTask(...actions.update);
    pushState(task, (action === 'undo' ? 'redo' : 'undo'), state);
    rootTask = root(task);
    detail = {
      currentState: lastState,
      oldState: state
    };
    triggerEvent(rootTask, 'after-switch-state', detail);
    return triggerEvent(rootTask, `after-${action}`, detail);
  };

  undo = function(task) {
    return history(task, 'undo');
  };

  redo = function(task) {
    return history(task, 'redo');
  };

  Task.prototype.pushUndoState = function() {
    if (root(this).historyTrackingDisabled) {
      return;
    }
    return pushUndoState(this);
  };

  Task.prototype.stopTrackingHistory = function() {
    return root(this).historyTrackingDisabled = true;
  };

  Task.prototype.startTrackingHistory = function() {
    return delete root(this).historyTrackingDisabled;
  };

  Task.prototype._pushUndoState = function(callback) {
    var oldState, rootTask;
    if (callback && root(this).historyTrackingDisabled) {
      return callback();
    }
    rootTask = root(this);
    oldState = pushUndoState(rootTask);
    if (callback) {
      callback();
    }
    if (!oldState) {
      return;
    }
    if (!stateEqual(currentState(rootTask), oldState)) {
      return;
    }
    return popUndoState(rootTask);
  };

  Task.prototype.pushRedoState = function() {
    if (root(this).historyTrackingDisabled) {
      return;
    }
    return pushRedoState(this);
  };

  Task.prototype.popUndoState = function() {
    if (root(this).historyTrackingDisabled) {
      return;
    }
    return popUndoState(this);
  };

  Task.prototype.popRedoState = function() {
    if (root(this).historyTrackingDisabled) {
      return;
    }
    return popRedoState(this);
  };

  Task.prototype.undo = function() {
    undo(this);
    return this;
  };

  Task.prototype.redo = function() {
    redo(this);
    return this;
  };

  var error, handleError;

  handleError = function(task, prop, error) {
    var base, key, val;
    mustExist(task);
    // read all errors @example error(task)
    if (prop === void 0) {
      if (!Object.keys(task.errors).length) {
        return null;
      }
      return task.errors;
    // clear all errors @example error(task, null)
    } else if (prop === null) {
      task.errors = {};
      return task;
    } else if (typeof prop === 'string') {
      if (error === void 0) {
        // get the errors of a single prop @example error(task, 'name')
        return task.errors[prop] || null;
      }
      if (error === null) {
        // clear the errors of a single prop @example error(task, 'name', null)
        return delete task.errors[prop] && task;
      }
      // add an error to a single prop @example error(task, 'name', 'name error')
      (base = task.errors)[prop] || (base[prop] = []);
      if (!task.errors[prop].includes(error)) {
        task.errors[prop].push(error);
      }
      return task;
    // set or clear multiple prop errors by passing in an object
    // @example error(task, {name: 'e', beginning: null})
    } else if (typeof prop === 'object') {
      for (key in prop) {
        val = prop[key];
        handleError(task, key, val);
      }
      return task;
    } else {
      throw new Error('Unsupported case');
    }
  };

  error = function(task, prop, error) {
    var detail, isUpdated, key, newKeys, newV, oldKeys, oldV, ref, ref1, result, val;
    mustExist(task);
    [oldV, newV] = [{}, {}];
    ref = task.errors;
    for (key in ref) {
      val = ref[key];
      oldV[key] = val.slice().sort();
    }
    result = handleError(task, prop, error);
    ref1 = task.errors;
    for (key in ref1) {
      val = ref1[key];
      newV[key] = val.slice().sort();
    }
    [oldKeys, newKeys] = [Object.keys(oldV), Object.keys(newV)];
    isUpdated = !luda.arrayEqual(newKeys, oldKeys);
    isUpdated || (isUpdated = newKeys.some(function(key) {
      return !luda.arrayEqual(oldV[key], newV[key]);
    }));
    if (!isUpdated) {
      return result;
    }
    detail = {
      error: {
        oldVal: oldV,
        newVal: newV
      }
    };
    triggerEvent(task, 'after-touch', detail);
    triggerEvent(task, 'after-update', detail);
    return result;
  };

  Task.prototype.error = function(prop, val) {
    return error(this, prop, val);
  };

  var parse, stringify;

  stringify = function(task, cascaded = true) {
    var sortedTasks, tasks;
    mustExist(task);
    if (!cascaded) {
      return JSON.stringify(task.data);
    }
    tasks = descendants(task);
    if (!isRoot(task)) {
      tasks.unshift(task);
    }
    sortedTasks = asc(...tasks).map(function(t) {
      return t.data;
    });
    return JSON.stringify(sortedTasks);
  };

  parse = function(task, cascaded = true) {
    return JSON.parse(stringify(task, cascaded));
  };

  Task.prototype.parse = function(cascaded) {
    return parse(this, cascaded);
  };

  Task.prototype.stringify = function(cascaded) {
    return stringify(this, cascaded);
  };

  var travel;

  travel = function(task, secs) {
    var newBegin, newEnd, oldBegin, oldEnd;
    mustExist(task);
    if (isRoot(task)) {
      return;
    }
    if (secs === 0) {
      return;
    }
    if (!Number.isInteger(secs)) {
      throw new Error("distance must be an integer");
    }
    [oldBegin, oldEnd] = [new Time(task.data.beginning), new Time(task.data.end)];
    [newBegin, newEnd] = [oldBegin.calcSeconds(secs), oldEnd.calcSeconds(secs)];
    return tryUpdateSchedule(task, {
      beginning: newBegin,
      end: newEnd
    }, 'travel');
  };

  Task.prototype.travel = function(secs) {
    this._pushUndoState(() => {
      return travel(this, secs);
    });
    return this;
  };

  luda.component('kickoffGantt').protect(modelable.all()).protect({
    ascTasks: function() {
      return Task.asc(...this.rootTask().descendants());
    },
    adjustTimelineRange: function(mode) {
      return this.timeline().fit(this.rootTask().beginning() || new Time(), this.rootTask().end() || new Time(), mode);
    }
  }).protect({
    template: function() {
      return `<div class='kickoff-gantt-timeline' data-uid='${this.rootTask().uid}'></div> <div class='kickoff-gantt-links' data-uid='${this.rootTask().uid}'></div> <div class='kickoff-gantt-tasks' data-uid='${this.rootTask().uid}'></div>`;
    },
    render: function() {
      return this.root.html(this.template());
    }
  }).protect({
    linkTemplate: function(task) {
      return `<div class='kickoff-gantt-link' data-uid='${task.uid}'></div>`;
    },
    findLinkDom: function(task) {
      return this.linksContainerDom.find(`.kickoff-gantt-link[data-uid='${task.uid}']`);
    },
    findLinkDoms: function(tasks) {
      var s;
      s = tasks.map(function(task) {
        return `.kickoff-gantt-link[data-uid='${task.uid}']`;
      });
      return this.linksContainerDom.children(s.join(','));
    },
    refreshLinkDomSiblings: function(task) {
      var ascTasks, i, nexts, prevs;
      ascTasks = this.ascTasks();
      i = ascTasks.indexOf(task);
      if (i === ascTasks.length - 1) {
        return;
      }
      [prevs, nexts] = [ascTasks.slice(0, i), ascTasks.slice(i + 1)];
      prevs = prevs.filter(function(t) {
        return t.deps().some(function(d) {
          return nexts.includes(d);
        });
      });
      return luda.kickoffGanttLink(this.findLinkDoms(prevs.concat(nexts))).render();
    },
    insertLinkDom: function(task) {
      var d;
      if ((d = this.findLinkDom(task)).length) {
        return luda.kickoffGanttLink(d).render();
      }
      this.linksContainerDom.append(this.linkTemplate(task));
      return this.refreshLinkDomSiblings(task);
    },
    removeLinkDom: function(task) {
      this.refreshLinkDomSiblings(task);
      return this.findLinkDom(task).remove();
    },
    insertLinkDoms: function() {
      return this.linksContainerDom.html(this.ascTasks().map((t) => {
        return this.linkTemplate(t);
      }).join(''));
    }
  }).protect({
    taskTemplate: function(task) {
      return `<div class='kickoff-gantt-task' data-uid='${task.uid}'></div>`;
    },
    findTaskDom: function(task) {
      return this.tasksContainerDom.find(`.kickoff-gantt-task[data-uid='${task.uid}']`);
    },
    insertTaskDom: function(task) {
      var d, prev, prevLastChd;
      if ((d = this.findTaskDom(task)).length) {
        return luda.kickoffGanttTask(d).render();
      }
      prev = task.prevSibling();
      if (prev && (prevLastChd = prev.lastChild())) {
        prev = prevLastChd;
      }
      prev || (prev = task.parent());
      task.one(`after-render-in-gantt.${this.id}`, () => {
        var node;
        node = this.findTaskDom(task).find('.kickoff-gantt-task-content').get(0);
        if (node.scrollIntoViewIfNeeded) {
          return node.scrollIntoViewIfNeeded();
        } else {
          return node.scrollIntoView();
        }
      });
      if (prev) {
        return this.findTaskDom(prev).after(this.taskTemplate(task));
      }
      return this.tasksContainerDom.prepend(this.taskTemplate(task));
    },
    removeTaskDom: function(task) {
      return this.findTaskDom(task).remove();
    },
    insertTaskDoms: function() {
      return this.tasksContainerDom.html(this.ascTasks().map((t) => {
        return this.taskTemplate(t);
      }).join(''));
    }
  }).help({
    create: function() {
      this.adjustTimelineRange();
      this.rootTask().on(`after-create.${this.id}`, (event) => {
        if (event.target.isRoot()) {
          return;
        }
        if (this.adjustTimelineRange('grow') || (this._reinserting != null)) {
          return;
        }
        this.insertLinkDom(event.target);
        return this.insertTaskDom(event.target);
      });
      this.rootTask().on(`after-destroy.${this.id}`, (event) => {
        if (event.target.isRoot()) {
          return;
        }
        this.removeTaskDom(event.target);
        return this.removeLinkDom(event.target);
      });
      this.rootTask().on(`after-update.${this.id}`, (event) => {
        if (event.target.isRoot()) {
          return;
        }
        if (this.adjustTimelineRange('grow')) ;
      });
      this.rootTask().on(`after-toggle-in-gantt.${this.id}`, (event) => {
        return this.refreshLinkDomSiblings(event.target);
      });
      this.timeline().on(`after-update.${this.id}`, (event) => {
        if (this.adjustTimelineRange()) {
          return event.stopImmediatePropagation();
        }
      });
      this.timeline().on(`after-render.${this.id}`, (event) => {
        clearTimeout(this._reinserting);
        return this._reinserting = setTimeout(() => {
          this.insertLinkDoms();
          this.insertTaskDoms();
          return this._reinserting = null;
        });
      });
      return this.render();
    },
    destroy: function() {
      var ref, ref1, ref2, ref3, ref4, ref5;
      clearTimeout(this._reinserting);
      if ((ref = this.rootTask()) != null) {
        ref.off(`after-create.${this.id}`);
      }
      if ((ref1 = this.rootTask()) != null) {
        ref1.off(`after-destroy.${this.id}`);
      }
      if ((ref2 = this.rootTask()) != null) {
        ref2.off(`after-update.${this.id}`);
      }
      if ((ref3 = this.rootTask()) != null) {
        ref3.off(`after-toggle-in-gantt.${this.id}`);
      }
      if ((ref4 = this.timeline()) != null) {
        ref4.off(`after-update.${this.id}`);
      }
      return (ref5 = this.timeline()) != null ? ref5.off(`after-render.${this.id}`) : void 0;
    },
    find: function() {
      return {
        tasksContainerDom: '.kickoff-gantt-tasks',
        linksContainerDom: '.kickoff-gantt-links'
      };
    }
  });

  luda.component('kickoffGanttLink').protect(modelable.all()).protect({
    arrowWidth: 8,
    arrowHeight: 8
  }).include({
    render: function() {
      clearTimeout(this._rendering);
      return this._rendering = setTimeout(() => {
        var lines, shouldKeep;
        if (!this.model()) {
          return;
        }
        if (!this.findTaskContentDom(this.model()).length) {
          return;
        }
        [lines, shouldKeep] = [this.findLineDoms(), luda()];
        ['s2s', 'f2f', 's2f', 'f2s'].forEach((type) => {
          return this.model()[`${type}Deps`]().forEach((depc) => {
            var drawLine, isExisted, line, polyline;
            isExisted = (line = lines.filter(`[data-uid='${depc.uid}']`)).length;
            if (!isExisted) {
              this.root.append(line = this.lineDom(depc));
            }
            shouldKeep = shouldKeep.add(line);
            polyline = line.children('polyline');
            drawLine = function() {
              var linePoints, shouldHide;
              clearTimeout(this._showingLine);
              shouldHide = Boolean(depc.isHidden);
              shouldHide || (shouldHide = !(linePoints = this.points(type, depc)));
              if (shouldHide) {
                return line.addClass('is-hidden');
              }
              polyline.attr('points', linePoints);
              return this._showingLine = setTimeout((function() {
                return line.removeClass('is-hidden');
              }), 50);
            };
            if (isExisted) {
              return drawLine.call(this);
            }
            if (this.findTaskContentDom(depc).length) {
              drawLine.call(this);
            }
            depc.on(`after-render-in-gantt.${this.id}`, drawLine.bind(this));
            return depc.on(`after-range-in-gantt.${this.id}`, drawLine.bind(this));
          });
        });
        return lines.not(shouldKeep).remove().each((line) => {
          var depc;
          if (!(depc = this.rootTask().find(luda(line).data('uid')))) {
            return;
          }
          depc.off(`after-render-in-gantt.${this.id}`);
          return depc.off(`after-range-in-gantt.${this.id}`);
        });
      });
    },
    preview: function(type, to) {
      var dict, isExisted, left, line, pointDom, points, rootPos, top;
      dict = {
        start: 'Beginning',
        finish: 'End'
      };
      pointDom = this[`findTaskLinks${dict[type]}Dom`](this.model());
      ({left, top} = pointDom.offset());
      rootPos = this.root.offset();
      left = left - rootPos.left + pointDom.outerWidth() / 2;
      top = top - rootPos.top + pointDom.outerHeight() / 2;
      points = [[left, top], [to.pageX - rootPos.left, to.pageY - rootPos.top]];
      points = points.concat(points.slice().reverse());
      points = points.map(function(arr) {
        return arr.join(' ');
      }).join(',');
      isExisted = (line = this.findPreviewLineDom()).length;
      if (!isExisted) {
        this.root.prepend(line = this.previewLineDom());
      }
      return line.addClass('is-previewing').children('polyline').attr('points', points);
    },
    resetPreview: function() {
      return this.findPreviewLineDom().removeClass('is-previewing');
    }
  }).protect({
    lineDom: function(depc) {
      return luda(`<svg class='kickoff-gantt-link-line' data-uid='${depc.uid}'> <polyline /> </svg>`);
    },
    previewLineDom: function() {
      return luda('<svg class="kickoff-gantt-link-preview-line"><polyline /></svg>');
    },
    findLineDom: function(depc) {
      return this.root.find(`.kickoff-gantt-link-line[data-uid='${depc.uid}']`);
    },
    findLineDoms: function() {
      return this.root.children('.kickoff-gantt-link-line');
    },
    findTaskDom: function(task) {
      return luda(`.kickoff-gantt-task[data-uid='${task.uid}']`);
    },
    findTaskContentDom: function(task) {
      return this.findTaskDom(task).find('.kickoff-gantt-task-content');
    },
    findPreviewLineDom: function() {
      return this.root.find('.kickoff-gantt-link-preview-line');
    },
    findTaskLinksBeginningDom: function(task) {
      return this.findTaskDom(task).find('.kickoff-gantt-task-links-beginning');
    },
    findTaskLinksEndDom: function(task) {
      return this.findTaskDom(task).find('.kickoff-gantt-task-links-end');
    }
  }).protect({
    points: function(type, depc) {
      return this[`${type}Polyline`](depc).map(function(arr) {
        return arr.join(' ');
      }).join(',');
    },
    s2sPolyline: function(depc) {
      var arrow, exchanged, from, minXWidth, points, to, x1, x2, x3, x4, y1, y2, y3, y4;
      [from, to] = [this.position(depc), this.position(this.model())];
      if (!(from && to)) {
        return [];
      }
      minXWidth = this.timelineCellWidth() / 2;
      arrow = this.arrowRightPoints(to);
      x1 = Math.min(from.left, to.left);
      if (from.left !== x1) {
        [from, to, exchanged] = [to, from, true];
      }
      y1 = from.top;
      [x2, y2] = [x1 - minXWidth, y1];
      [x4, y4] = [to.left, to.top];
      [x3, y3] = [x2, y4];
      points = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]];
      if (!exchanged) {
        return points.concat(arrow, points.slice().reverse());
      }
      return points.concat(points.slice().reverse(), arrow);
    },
    f2fPolyline: function(depc) {
      var arrow, exchanged, from, minXWidth, points, to, x1, x2, x3, x4, y1, y2, y3, y4;
      [from, to] = [this.position(depc), this.position(this.model())];
      if (!(from && to)) {
        return [];
      }
      minXWidth = this.timelineCellWidth() / 2;
      arrow = this.arrowLeftPoints(to);
      x1 = Math.max(from.right, to.right);
      if (from.right !== x1) {
        [from, to, exchanged] = [to, from, true];
      }
      y1 = from.top;
      [x2, y2] = [x1 + minXWidth, y1];
      [x4, y4] = [to.right, to.top];
      [x3, y3] = [x2, y4];
      points = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]];
      if (!exchanged) {
        return points.concat(arrow, points.slice().reverse());
      }
      return points.concat(points.slice().reverse(), arrow);
    },
    s2fPolyline: function(depc) {
      var arrow, from, line, minXWidth, rowGap, to, x1, x2, x3, x4, x5, x6, y1, y2, y3, y4, y5, y6;
      [from, to] = [this.position(depc), this.position(this.model())];
      if (!(from && to)) {
        return [];
      }
      minXWidth = this.timelineCellWidth() / 2;
      arrow = this.arrowLeftPoints(to);
      if (to.right + minXWidth > from.left - minXWidth) {
        [x1, y1] = [from.left, from.top];
        [x2, y2] = [x1 - minXWidth, y1];
        [x6, y6] = [to.right, to.top];
        [x5, y5] = [x6 + minXWidth, y6];
        [x3, x4] = [x2, x5];
        rowGap = this.findTaskDom(this.model()).outerHeight() / 2;
        y3 = y4 = y1 < y6 ? y5 - rowGap : y5 + rowGap;
        line = [[x1, y1], [x2, y2], [x3, y3], [x4, y4], [x5, y5], [x6, y6]];
      } else {
        [x1, y1] = [from.left, from.top];
        [x4, y4] = [to.right, to.top];
        [x3, y3] = [x4 + minXWidth, y4];
        [x2, y2] = [x3, y1];
        line = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]];
      }
      return line.concat(arrow, line.slice().reverse());
    },
    f2sPolyline: function(depc) {
      var arrow, from, line, minXWidth, rowGap, to, x1, x2, x3, x4, x5, x6, y1, y2, y3, y4, y5, y6;
      [from, to] = [this.position(depc), this.position(this.model())];
      if (!(from && to)) {
        return [];
      }
      minXWidth = this.timelineCellWidth() / 2;
      arrow = this.arrowRightPoints(to);
      if (from.right + minXWidth > to.left - minXWidth) {
        [x1, y1] = [from.right, from.top];
        [x2, y2] = [x1 + minXWidth, y1];
        [x6, y6] = [to.left, to.top];
        [x5, y5] = [x6 - minXWidth, y6];
        [x3, x4] = [x2, x5];
        rowGap = this.findTaskDom(this.model()).outerHeight() / 2;
        y3 = y4 = y1 < y6 ? y5 - rowGap : y5 + rowGap;
        line = [[x1, y1], [x2, y2], [x3, y3], [x4, y4], [x5, y5], [x6, y6]];
      } else {
        [x1, y1] = [from.right, from.top];
        [x4, y4] = [to.left, to.top];
        [x3, y3] = [x4 - minXWidth, y4];
        [x2, y2] = [x3, y1];
        line = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]];
      }
      return line.concat(arrow, line.slice().reverse());
    },
    arrowRightPoints: function(to) {
      var arrowB, arrowT, arrowX;
      arrowX = to.left - this.arrowWidth;
      [arrowT, arrowB] = [to.top + this.arrowHeight / 2, to.top - this.arrowHeight / 2];
      return [[arrowX, arrowT], [arrowX, arrowB], [to.left, to.top]];
    },
    arrowLeftPoints: function(to) {
      var arrowB, arrowT, arrowX;
      arrowX = to.right + this.arrowWidth;
      [arrowT, arrowB] = [to.top + this.arrowHeight / 2, to.top - this.arrowHeight / 2];
      return [[arrowX, arrowT], [arrowX, arrowB], [to.right, to.top]];
    },
    position: function(model) {
      var height, left, node, top, width;
      node = this.findTaskContentDom(model);
      if (!node.length) {
        return;
      }
      width = luda(node).outerWidth();
      height = luda(node).outerHeight();
      ({left, top} = luda(node).position());
      return {
        left,
        top: top + height / 2,
        right: left + width
      };
    },
    timelineCellWidth: function() {
      var s;
      s = `.kickoff-gantt-timeline-background[data-uid='${this.rootTask().uid}'] .kickoff-gantt-timeline-cell`;
      return luda(s).outerWidth();
    }
  }).help({
    create: function() {
      var model;
      if (!(model = this.model())) {
        return;
      }
      this.render();
      this.model().on(`after-render-in-gantt.${this.id}`, (event) => {
        if (this.model() === event.target) {
          return this.render();
        }
      });
      return this.model().on(`after-range-in-gantt.${this.id}`, (event) => {
        if (this.model() === event.target) {
          return this.render();
        }
      });
    },
    destroy: function() {
      var ref, ref1, ref2;
      clearTimeout(this._rendering);
      clearTimeout(this._showingLine);
      if ((ref = this.model()) != null) {
        ref.off(`after-render-in-gantt.${this.id}`);
      }
      if ((ref1 = this.model()) != null) {
        ref1.off(`after-range-in-gantt.${this.id}`);
      }
      return (ref2 = this.model()) != null ? ref2.deps().forEach((depc) => {
        depc.off(`after-render-in-gantt.${this.id}`);
        return depc.off(`after-range-in-gantt.${this.id}`);
      }) : void 0;
    }
  });

  luda.component('kickoffGanttTask').protect(modelable.all()).protect(localeable.all()).include({
    render: function() {
      clearTimeout(this._rendering);
      return this._rendering = setTimeout(() => {
        var model;
        if (!(model = this.model())) {
          return;
        }
        if (!this.container.length) {
          this.root.html('<div class="kickoff-gantt-task-content"></div>');
        }
        this.setCls();
        this.container.html(this.template());
        this.renderRange();
        this.executeCustomGraphRenderer();
        this.executeCustomActionsRenderer();
        this.executeCustomLinkActionsRenderer();
        this.executeCustomSummaryRenderer();
        return model.trigger('after-render-in-gantt');
      });
    },
    left: function(pos) {
      if (pos != null) {
        if (this.model().isMilestone()) {
          pos += this.root.height() / 2;
        }
        this.model().beginning(this.pxToTime(pos));
        return this.render();
      } else {
        pos = this.timeToPx(this.model().beginning());
        if (this.model().isMilestone()) {
          pos -= this.root.height() / 2;
        }
        return pos;
      }
    },
    right: function(pos) {
      if (pos != null) {
        if (this.model().isMilestone()) {
          pos -= this.root.height() / 2;
        }
        this.model().end(this.pxToTime(pos));
        return this.render();
      } else {
        pos = this.timeToPx(this.model().end());
        if (this.model().isMilestone()) {
          pos += this.root.height() / 2;
        }
        return pos;
      }
    },
    move: function(pos) {
      if (!pos) {
        return;
      }
      this.model().travel(parseInt(pos / this.pxPerSec(), 10));
      return this.render();
    }
  }).protect({
    pxPerSec: function() {
      return this.root.width() / this.timeline().duration().seconds;
    },
    pxToTime: function(px) {
      return this.timeline().beginning().nextSecond(parseInt(px / this.pxPerSec(), 10));
    },
    timeToPx: function(time) {
      return time.since(this.timeline().beginning()).seconds * this.pxPerSec();
    }
  }).protect({
    renderRange: function() {
      var left, right, width;
      [left, right] = [this.left(), this.right()];
      width = right - left;
      return this.container.css({left, width});
    },
    customRenderers: function() {
      var action, actionTypes, cap, configRendererName, customRenderer, i, j, len, len1, modelType, rendererTypes, renderers, t;
      [renderers, modelType] = [{}, capitalize(this.model().type())];
      rendererTypes = ['Graph', 'Actions', 'LinkActions', 'Summary'];
      for (i = 0, len = rendererTypes.length; i < len; i++) {
        t = rendererTypes[i];
        customRenderer = this.config()[`renderGantt${modelType}${t}`];
        if (customRenderer) {
          renderers[`render${t}`] = customRenderer;
        }
      }
      actionTypes = (function() {
        var j, len1, ref, results;
        ref = this.model().actions();
        results = [];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          action = ref[j];
          results.push(action);
        }
        return results;
      }).call(this);
      for (j = 0, len1 = actionTypes.length; j < len1; j++) {
        t = actionTypes[j];
        cap = capitalize(t);
        configRendererName = `renderGantt${modelType}Action${cap}`;
        customRenderer = this.config()[configRendererName];
        if (!taskActions.includes(t)) {
          if (!customRenderer) {
            console.error(`Custom action ${t} is defined, but ${configRendererName} is not defined.`);
          }
        }
        if (customRenderer) {
          renderers[`renderAction${cap}`] = customRenderer;
        }
      }
      return renderers;
    },
    executeCustomGraphRenderer: function() {
      var graphContainer, renderGraph;
      ({renderGraph} = this.customRenderers());
      this.root.toggleClass('with-custom-graph-renderer', Boolean(renderGraph));
      if (!renderGraph) {
        return;
      }
      if (this.model().isHidden) {
        return;
      }
      graphContainer = this.root.find('.kickoff-gantt-task-bar-body').get(0);
      return renderGraph.call(this.model(), this.model(), graphContainer);
    },
    executeCustomActionsRenderer: function() {
      var action, actionContainer, actionSlot, actionsContainer, i, len, ref, renderAction, renderActions, renderers, results;
      renderers = this.customRenderers();
      renderActions = renderers.renderActions;
      this.root.toggleClass('with-custom-actions-renderer', Boolean(renderActions));
      if (renderActions) {
        if (this.model().isHidden) {
          return;
        }
        actionsContainer = this.root.find('.kickoff-gantt-task-popover-actions').get(0);
        return renderActions.call(this.model(), this.model(), actionsContainer);
      }
      ref = this.model().actions();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        action = ref[i];
        if (renderAction = renderers[`renderAction${capitalize(action)}`]) {
          actionSlot = `.kickoff-gantt-task-popover-actions .with-custom-action-renderer-${luda.dashCase(action)}`;
          actionContainer = this.root.find(actionSlot).get(0);
          results.push(renderAction.call(this.model(), this.model(), actionContainer));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    executeCustomLinkActionsRenderer: function() {
      var actionsContainer, hasClass, renderLinkActions, selector;
      ({renderLinkActions} = this.customRenderers());
      hasClass = Boolean(renderLinkActions);
      this.root.toggleClass('with-custom-link-actions-renderer', hasClass);
      if (!renderLinkActions) {
        return;
      }
      if (this.model().isHidden) {
        return;
      }
      selector = '.kickoff-gantt-task-popover-link-actions';
      actionsContainer = this.root.find(selector).get(0);
      return renderLinkActions.call(this.model(), this.model(), actionsContainer);
    },
    executeCustomSummaryRenderer: function() {
      var renderSummary, summaryContainer;
      ({renderSummary} = this.customRenderers());
      this.root.toggleClass('with-custom-summary-renderer', Boolean(renderSummary));
      if (!renderSummary) {
        return;
      }
      if (this.model().isHidden) {
        return;
      }
      summaryContainer = this.root.find('.kickoff-gantt-task-popover-summary').get(0);
      return renderSummary.call(this.model(), this.model(), summaryContainer);
    }
  }).protect({
    dragDimensions: function(event) {
      if (!('dragStartLeft' in this)) {
        this.dragStartLeft = this.left();
      }
      if (!('dragStartRight' in this)) {
        this.dragStartRight = this.right();
      }
      if (!('dragStartX' in this)) {
        this.dragStartX = event.screenX;
      }
      return {
        startLeft: this.dragStartLeft,
        startRight: this.dragStartRight,
        startX: this.dragStartX,
        startWidth: this.dragStartRight - this.dragStartLeft,
        distance: event.screenX - this.dragStartX
      };
    },
    resetDragDimensions: function() {
      delete this.dragStartLeft;
      delete this.dragStartRight;
      return delete this.dragStartX;
    },
    previewTravel: function(event) {
      var distance, startLeft;
      if (luda(event.target).hasClass('is-readonly')) {
        return;
      }
      ({startLeft, distance} = this.dragDimensions(event));
      this.container.css('left', startLeft + distance);
      return this.model().trigger('after-range-in-gantt');
    },
    travel: function(event) {
      if (luda(event.target).hasClass('is-readonly')) {
        return;
      }
      this.move(this.dragDimensions(event).distance);
      return this.resetDragDimensions();
    },
    previewBegin: function(event) {
      var distance, startLeft, startWidth;
      ({startWidth, startLeft, distance} = this.dragDimensions(event));
      this.container.css({
        width: startWidth - distance,
        left: startLeft + distance
      });
      return this.model().trigger('after-range-in-gantt');
    },
    setBegin: function(event) {
      var distance, startLeft;
      ({startLeft, distance} = this.dragDimensions(event));
      this.left(startLeft + distance);
      return this.resetDragDimensions();
    },
    previewEnd: function(event) {
      var distance, startWidth;
      ({startWidth, distance} = this.dragDimensions(event));
      this.container.css('width', startWidth + distance);
      return this.model().trigger('after-range-in-gantt');
    },
    setEnd: function(event) {
      var distance, startRight;
      ({startRight, distance} = this.dragDimensions(event));
      this.right(startRight + distance);
      return this.resetDragDimensions();
    }
  }).protect({
    linkNode: function() {
      return luda(`.kickoff-gantt-link[data-uid='${this.model().uid}']`);
    },
    previewLinkFrom: function(type, to) {
      var cursorCls, point, successorsPropIsReadonly;
      successorsPropIsReadonly = this.model().readonly('successors');
      this.con._isLinkingFrom = {
        task: this.model(),
        type
      };
      point = type === 'finish' ? this.linksEnd : this.linksBeginning;
      point.addClass('is-linking');
      cursorCls = successorsPropIsReadonly ? 'is-invalid' : 'is-valid';
      point.addClass(cursorCls);
      this.linksContainer.addClass('is-linking');
      return luda.kickoffGanttLink(this.linkNode()).preview(type, to);
    },
    resetPreviewLinkFrom: function() {
      if (this.rootTask() == null) {
        return;
      }
      luda.kickoffGanttLink(this.linkNode()).resetPreview();
      this.linksEnd.removeClass('is-linking is-valid is-invalid');
      this.linksBeginning.removeClass('is-linking is-valid is-invalid');
      this.linksContainer.removeClass('is-linking');
      return delete this.con._isLinkingFrom;
    },
    previewLinkFromStart: function(event) {
      return this.previewLinkFrom('start', {
        pageX: event.pageX,
        pageY: event.pageY
      });
    },
    previewLinkFromFinish: function(event) {
      return this.previewLinkFrom('finish', {
        pageX: event.pageX,
        pageY: event.pageY
      });
    },
    previewLinkTo: function(type) {
      var cursorCls, from, isValid, point, predecessorsPropIsReadonly;
      if (!(from = this.con._isLinkingFrom)) {
        return;
      }
      predecessorsPropIsReadonly = this.model().readonly('predecessors');
      this.con._isLinkingTo = {
        task: this.model(),
        type
      };
      if (from.task === this.model()) {
        return;
      }
      point = type === 'finish' ? this.linksEnd : this.linksBeginning;
      point.addClass('is-linking');
      if (point.hasClass('is-valid')) {
        return;
      }
      if (point.hasClass('is-invalid')) {
        return;
      }
      if (predecessorsPropIsReadonly) {
        isValid = false;
      } else {
        isValid = this.con._isLinkingFrom.task.isValidDepcOf(this.con._isLinkingTo.task);
      }
      cursorCls = isValid ? 'is-valid' : 'is-invalid';
      return point.addClass(cursorCls);
    },
    previewLinkToStart: function(event) {
      return this.previewLinkTo('start');
    },
    previewLinkToFinish: function(event) {
      return this.previewLinkTo('finish');
    },
    resetPreviewLinkTo: function() {
      var selector, to;
      if (!(to = this.con._isLinkingTo)) {
        return;
      }
      selector = `.kickoff-gantt-task[data-uid='${to.task.uid}'] .kickoff-gantt-task-links *`;
      this.root.parent('.kickoff-gantt-tasks').find(selector).removeClass('is-linking is-valid is-invalid');
      return delete this.con._isLinkingTo;
    },
    addLink: function() {
      var from, to, type;
      if (!(from = this.con._isLinkingFrom)) {
        return;
      }
      if (from.task.readonly('successors')) {
        return this.resetPreviewLinkFrom();
      }
      this.resetPreviewLinkFrom();
      if (!(to = this.con._isLinkingTo)) {
        return;
      }
      if (to.task.readonly('predecessors')) {
        return this.resetPreviewLinkTo();
      }
      type = luda.camelCase(`${from.type}-to-${to.type}`);
      to.task.addPredecessors(type, from.task);
      return this.resetPreviewLinkTo();
    }
  }).protect({
    setCls: function() {
      var oldHidden;
      oldHidden = Boolean(this._isHidden);
      this._isHidden = Boolean(this.model().isHidden);
      this.root.toggleClass('is-picked', Boolean(this.model().isPicked));
      this.root.toggleClass('is-milestone', this.model().isMilestone());
      this.root.toggleClass('is-task', this.model().isTask());
      this.root.toggleClass('is-folded', Boolean(this.model().isFolded));
      this.root.toggleClass('is-hidden', this._isHidden);
      if (oldHidden === this._isHidden) {
        return;
      }
      return this.model().trigger('after-toggle-in-gantt', this._isHidden);
    },
    closeProper: function() {
      return luda.kickoffProper(this.proper).deactivate();
    }
  }).protect({
    template: function() {
      return `<label class='kickoff-gantt-task-label'>${this.labelTemplate()}</label> <div class='kickoff-gantt-task-bar kickoff-proper'>${this.barTemplate()}</div> <div class='kickoff-gantt-task-links'>${this.linkPointsTemplate()}</div>`;
    },
    labelTemplate: function() {
      var name;
      name = this.model().data.name;
      if (name == null) {
        name = '';
      }
      return `${this.model().data.wbs} ${name}`;
    },
    barTemplate: function() {
      var bodyCls, html, isTask, model;
      model = this.model();
      [html, isTask] = ['', model.isTask()];
      if (isTask && !model.readonly('beginning')) {
        html += "<div class='kickoff-gantt-task-bar-beginning'></div>";
      }
      bodyCls = 'kickoff-gantt-task-bar-body';
      if (model.readonly('beginning') || model.readonly('end')) {
        bodyCls += ' is-readonly';
      }
      html += `<div class='${bodyCls}'></div>`;
      if (isTask && !model.readonly('end')) {
        html += "<div class='kickoff-gantt-task-bar-end'></div>";
      }
      return html += `<div class='kickoff-proper-popover kickoff-gantt-task-popover'> ${this.popoverTemplate()} </div>`;
    },
    linkPointsTemplate: function() {
      return "<div class='kickoff-gantt-task-links-beginning'></div> <div class='kickoff-gantt-task-links-end'></div>";
    },
    popoverTemplate: function() {
      var html, renderActions, renderLinkActions, renderSummary;
      html = '';
      ({renderActions, renderLinkActions, renderSummary} = this.customRenderers());
      if (renderActions) {
        html += "<div class='kickoff-gantt-task-popover-actions'></div>";
      } else {
        html += this.popoverActionsTemplate();
      }
      if (renderLinkActions) {
        html += "<div class='kickoff-gantt-task-popover-link-actions'></div>";
      } else {
        html += this.popoverLinkActionsTemplate();
      }
      if (renderSummary) {
        html += "<div class='kickoff-gantt-task-popover-summary'></div>";
      } else {
        html += this.popoverSummaryTemplate();
      }
      return html;
    },
    popoverActionsTemplate: function() {
      var action, actions, customRenderer, customRendererSlot, defaultRenderer, html, i, len, model, render, renderers, uid;
      [model, renderers] = [this.model(), this.customRenderers()];
      [uid, actions] = [model.uid, model.actions()];
      if (!actions.length) {
        return '';
      }
      customRendererSlot = function(action) {
        return `<div class='with-custom-action-renderer-${luda.dashCase(action)}'></div>`;
      };
      defaultRenderer = function(action) {
        var cls;
        if (['pick', 'fold', 'destroy'].includes(action)) {
          cls = `${action}-task`;
        } else if (action === 'update') {
          cls = 'edit-task';
        } else if (['createTask', 'createMilestone'].includes(action)) {
          cls = luda.dashCase(action);
        }
        if (cls) {
          return `<button class='kickoff-button-${cls}' data-uid='${uid}'></button>`;
        } else {
          return customRendererSlot(action);
        }
      };
      html = "";
      for (i = 0, len = actions.length; i < len; i++) {
        action = actions[i];
        customRenderer = renderers[`renderAction${capitalize(action)}`];
        render = customRenderer ? customRendererSlot : defaultRenderer;
        html += render(action);
      }
      return `<div class='kickoff-gantt-task-popover-actions'>${html}</div>`;
    },
    popoverLinkActionsTemplate: function() {
      var deps, fragment, html, linkButtons, model, type, uid;
      [html, model] = ["", this.model()];
      [uid, linkButtons] = [
        model.uid,
        {
          s2s: '',
          s2f: '',
          f2f: '',
          f2s: ''
        }
      ];
      deps = model.deps();
      if (deps.length === 0 || model.readonly('predecessors')) {
        return '';
      }
      deps.forEach(function(depc) {
        var disabled, key;
        key = model.depcType(depc).shortcut;
        disabled = depc.readonly('successors') ? 'disabled' : '';
        return linkButtons[key] += `<button class='kickoff-button-destroy-link' data-uid='${uid}' data-from='${depc.uid}' ${disabled}> </button>`;
      });
      for (type in linkButtons) {
        fragment = linkButtons[type];
        html += fragment;
      }
      return `<div class='kickoff-gantt-task-popover-link-actions'>${html}</div>`;
    },
    popoverSummaryTemplate: function() {
      var dayCount, html;
      html = `<h6 class='kickoff-gantt-task-popover-summary-title'> ${this.labelTemplate()} </h6>`;
      if (this.model().isMilestone()) {
        html += `<p class='kickoff-gantt-task-popover-summary-item'> <span>${this.l('task.props.time')}:</span> <span>${this.model().data.end}</span> </p>`;
      } else {
        dayCount = Math.round(this.model().duration().days);
        html += `<p class='kickoff-gantt-task-popover-summary-item'> <span>${this.l('task.props.beginning')}:</span> <span>${this.model().data.beginning}</span> </p> <p class='kickoff-gantt-task-popover-summary-item'> <span>${this.l('task.props.end')}:</span> <span>${this.model().data.end}</span> </p> <p class='kickoff-gantt-task-popover-summary-item'> <span>${this.l('task.props.duration')}:</span> <span> ${dayCount} ${this.l('task.durationUnits.day')} </span> </p>`;
      }
      return `<div class='kickoff-gantt-task-popover-summary'>${html}</div>`;
    }
  }).help({
    create: function() {
      var model;
      if (!(model = this.model())) {
        return;
      }
      this.render();
      model.on(`after-touch.${this.id}`, (event, touched) => {
        if (model !== event.target) {
          return;
        }
        if ('beginning' in touched || 'end' in touched) {
          return this.render();
        }
      });
      return model.on(`after-update.${this.id}`, (event, updated) => {
        var ks;
        if (model !== event.target) {
          return;
        }
        ks = Object.keys(updated);
        if (ks.length === 1 && ks[0] === 'isPicked') {
          return this.setCls();
        }
        if (ks.some(function(k) {
          return k === 'wbs' || k === 'name' || k === 'beginning' || k === 'end' || k === 'isHidden';
        })) {
          return this.render();
        }
        this.setCls();
        this.popover.html(this.popoverTemplate());
        this.executeCustomGraphRenderer();
        this.executeCustomActionsRenderer();
        this.executeCustomLinkActionsRenderer();
        this.executeCustomSummaryRenderer();
        return model.trigger('after-render-in-gantt');
      });
    },
    destroy: function() {
      var ref, ref1;
      clearTimeout(this._rendering);
      this.resetPreviewLinkTo();
      this.resetPreviewLinkFrom();
      if ((ref = this.model()) != null) {
        ref.off(`after-touch.${this.id}`);
      }
      return (ref1 = this.model()) != null ? ref1.off(`after-update.${this.id}`) : void 0;
    },
    listen: function() {
      return [['dragging', '.kickoff-gantt-task-bar-body', this.previewTravel], ['draggingend', '.kickoff-gantt-task-bar-body', this.travel], ['dragging', '.kickoff-gantt-task-bar-beginning', this.previewBegin], ['draggingend', '.kickoff-gantt-task-bar-beginning', this.setBegin], ['dragging', '.kickoff-gantt-task-bar-end', this.previewEnd], ['draggingend', '.kickoff-gantt-task-bar-end', this.setEnd], ['dragging', '.kickoff-gantt-task-links-beginning', this.previewLinkFromStart], ['draggingend', '.kickoff-gantt-task-links-beginning', this.addLink], ['dragging', '.kickoff-gantt-task-links-end', this.previewLinkFromFinish], ['draggingend', '.kickoff-gantt-task-links-end', this.addLink], ['mouseenter', '.kickoff-gantt-task-links-beginning', this.previewLinkToStart], ['mouseleave', '.kickoff-gantt-task-links-beginning', this.resetPreviewLinkTo], ['mouseenter', '.kickoff-gantt-task-links-end', this.previewLinkToFinish], ['mouseleave', '.kickoff-gantt-task-links-end', this.resetPreviewLinkTo], ['click', '.kickoff-button-edit-task', this.closeProper]];
    },
    find: function() {
      return {
        container: '.kickoff-gantt-task-content',
        linksContainer: '.kickoff-gantt-task-links',
        linksBeginning: '.kickoff-gantt-task-links-beginning',
        linksEnd: '.kickoff-gantt-task-links-end',
        proper: '.kickoff-proper',
        popover: '.kickoff-gantt-task-popover'
      };
    }
  });

  luda.component('kickoffGanttTimeline').protect(modelable.all()).protect({
    foregroundTemplate: function(groups) {
      var cls, group, html, i, len;
      html = "";
      if (!(groups && groups.length)) {
        return html;
      }
      for (i = 0, len = groups.length; i < len; i++) {
        group = groups[i];
        cls = `kickoff-gantt-timeline-${group.unit} `;
        cls += `kickoff-gantt-timeline-depth${group.depth} `;
        if (group.isWeekend) {
          cls += "kickoff-gantt-timeline-weekend ";
        }
        if (!group.groups) {
          cls += "kickoff-gantt-timeline-cell ";
        }
        html += `<div class='${cls}'>`;
        html += `<div class='kickoff-gantt-timeline-label'>${group.label}</div>`;
        if (group.groups) {
          html += "<div class='kickoff-gantt-timeline-group'>";
          html += this.foregroundTemplate(group.groups);
          html += "</div>";
        } else {
          html += this.exclusionTemplate(group);
          html += this.inclusionTemplate(group);
          html += this.foregroundFlagTemplate(group);
        }
        html += "</div>";
      }
      return html;
    },
    backgroundTemplate: function(groups) {
      var cls, group, html, i, len;
      html = "";
      if (!(groups && groups.length)) {
        return html;
      }
      for (i = 0, len = groups.length; i < len; i++) {
        group = groups[i];
        if (group.groups) {
          html += this.backgroundTemplate(group.groups);
        } else {
          cls = "kickoff-gantt-timeline-cell ";
          cls += `kickoff-gantt-timeline-${group.unit} `;
          if (group.isWeekend) {
            cls += "kickoff-gantt-timeline-weekend ";
          }
          html += `<div class='${cls}'>`;
          html += this.exclusionTemplate(group);
          html += this.inclusionTemplate(group);
          html += this.backgroundFlagTemplate(group);
          html += "</div>";
        }
      }
      return html;
    },
    specialDurationTemplate: function(cell, type = 'exclusion') {
      var cellB, cellE, cells, totalSeconds;
      if (!(cells = cell[`${type}s`]).length) {
        return '';
      }
      [cellB, cellE] = [cell.beginning, cell.end];
      totalSeconds = cell.end.since(cell.beginning).seconds;
      return cells.map(function(t) {
        var cls, left, style;
        style = `width:${t.end.since(t.beginning).seconds / totalSeconds * 100}%;`;
        if (t.end.equals(cell.end)) {
          style += "right:0";
        } else {
          left = t.beginning.since(cell.beginning).seconds / totalSeconds;
          style += `left:${left * 100}%`;
        }
        cls = `kickoff-gantt-timeline-${type} `;
        if (t.beginning.equals(cellB)) {
          cls += `kickoff-gantt-timeline-${type}-left `;
        }
        if (t.end.equals(cellE)) {
          cls += `kickoff-gantt-timeline-${type}-right `;
        }
        return `<div class='${cls}' style='${style}'></div>`;
      }).join('');
    },
    inclusionTemplate: function(cell) {
      return this.specialDurationTemplate(cell, 'inclusion');
    },
    exclusionTemplate: function(cell) {
      return this.specialDurationTemplate(cell, 'exclusion');
    },
    foregroundFlagTemplate: function(cell) {
      var totalSeconds;
      if (!cell.flags.length) {
        return '';
      }
      totalSeconds = cell.end.since(cell.beginning).seconds;
      return cell.flags.map(function(flag) {
        var cls, left, style;
        left = flag.time.since(cell.beginning).seconds / totalSeconds;
        style = `left:${left * 100}%`;
        cls = "kickoff-gantt-timeline-flag-label ";
        if (flag.cls) {
          cls += flag.cls;
        }
        return `<label class='${cls}' style='${style}'>${flag.label || 'FLAG'}</label>`;
      }).join('');
    },
    backgroundFlagTemplate: function(cell) {
      var totalSeconds;
      if (!cell.flags.length) {
        return '';
      }
      totalSeconds = cell.end.since(cell.beginning).seconds;
      return cell.flags.map(function(flag) {
        var cls, left, style;
        left = flag.time.since(cell.beginning).seconds / totalSeconds;
        style = `left:${left * 100}%`;
        cls = "kickoff-gantt-timeline-flag-line ";
        if (flag.cls) {
          cls += flag.cls;
        }
        return `<div class='${cls}' style='${style}'></div>`;
      }).join('');
    }
  }).protect({
    ensureOccupyFullWidth: function() {
      var duration, ganttWidth, leastDuration, pxPerSec, timelineWidth;
      timelineWidth = this.root.outerWidth();
      ganttWidth = this.root.parent('.kickoff-gantt').width();
      if (timelineWidth >= ganttWidth) {
        return true;
      }
      duration = this.timeline().duration().seconds;
      pxPerSec = timelineWidth / duration;
      leastDuration = ganttWidth / pxPerSec;
      this.timeline().duration(Math.ceil(leastDuration));
      return false;
    },
    renderForeground: function(groups) {
      return this.root.html(this.foregroundTemplate(groups));
    },
    renderBackground: function(groups) {
      var background, cls, dataAttr, uid;
      uid = this.rootTask().uid;
      [cls, dataAttr] = ['kickoff-gantt-timeline-background', `data-uid='${uid}'`];
      if (!(background = luda(`.${cls}[${dataAttr}]`)).length) {
        this.root.before(background = luda(`<div class='${cls}' ${dataAttr}>`));
      }
      return background.html(this.backgroundTemplate(groups));
    }
  }).protect({
    ensureResizeDetectorExist: function() {
      var cls, dataAttr, detector, uid;
      if (this.resizeDetector) {
        return this.resizeDetector;
      }
      uid = this.rootTask().uid;
      [cls, dataAttr] = ["kickoff-gantt-timeline-resize-detector", `data-uid='${uid}'`];
      if (!(detector = luda(`.${cls}[${dataAttr}]`)).length) {
        this.root.before(detector = luda(`<iframe class='${cls}' ${dataAttr}>`));
      }
      return this.resizeDetector = detector.get(0).contentWindow;
    },
    listenResize: function() {
      var detector;
      this.stopListeningResize();
      detector = this.ensureResizeDetectorExist();
      this.lastRenderWidth = detector.innerWidth;
      this.resizeRender = (function() {
        clearTimeout(this._resizeRendering);
        return this._resizeRendering = setTimeout((() => {
          var currentWidth;
          currentWidth = detector.innerWidth;
          if (currentWidth <= this.lastRenderWidth) {
            return;
          }
          this.lastRenderWidth = currentWidth;
          return this.render();
        }), this.config().resizeRenderDelay);
      }).bind(this);
      return detector.addEventListener('resize', this.resizeRender);
    },
    stopListeningResize: function() {
      var ref;
      if ((ref = this.ensureResizeDetectorExist()) != null) {
        ref.removeEventListener('resize', this.resizeRender);
      }
      return this.resizeRender = null;
    },
    render: function() {
      clearTimeout(this._rendering);
      return this._rendering = setTimeout(() => {
        var groups, unit;
        unit = this.timeline().unit();
        groups = this.timeline()[`${unit}s`]();
        this.renderForeground(groups);
        this.renderBackground(groups);
        if (!this.ensureOccupyFullWidth()) {
          return;
        }
        this.listenResize();
        return this.timeline().trigger('after-render');
      });
    }
  }).help({
    create: function() {
      this.timeline().on(`after-update.${this.id}`, (event, updated) => {
        return this.render();
      });
      return this.render();
    },
    destroy: function() {
      var ref;
      clearTimeout(this._rendering);
      clearTimeout(this._resizeRendering);
      this.stopListeningResize();
      return (ref = this.timeline()) != null ? ref.off(`after-update.${this.id}`) : void 0;
    }
  });

  luda.component('kickoffHeader').protect(modelable.all()).protect({
    render: function() {
      clearTimeout(this._rendering);
      return this._rendering = setTimeout(() => {
        this.root.html(this.template());
        this.executeCustomActionsRenderer();
        return this.executeCustomNavigationsRenderer();
      });
    },
    customRenderers: function() {
      var action, actions, i, j, len, len1, ref, renderer, rendererName, renderers, type;
      [renderers, actions] = [{}, this.model().actions()];
      ref = ['Actions', 'Navigations'];
      for (i = 0, len = ref.length; i < len; i++) {
        type = ref[i];
        renderer = this.config()[`renderHeader${type}`];
        if (renderer) {
          renderers[`render${type}`] = renderer;
        }
      }
      for (j = 0, len1 = actions.length; j < len1; j++) {
        action = actions[j];
        rendererName = `renderHeaderAction${capitalize(action)}`;
        renderer = this.config()[rendererName];
        if (!rootTaskActions.includes(action)) {
          if (!renderer) {
            console.error(`Custom action ${action} is defined, but custom render ${rendererName} is not defined.`);
          }
        }
        if (renderer) {
          renderers[`render${capitalize(action)}`] = renderer;
        }
      }
      return renderers;
    },
    executeCustomActionsRenderer: function() {
      var action, actionContainer, actionSlot, actionsContainer, i, len, ref, renderAction, renderActions, renderers, results;
      renderers = this.customRenderers();
      renderActions = renderers.renderActions;
      if (renderActions) {
        actionsContainer = this.root.find('.kickoff-header-actions').get(0);
        return renderActions.call(this.model(), this.model(), actionsContainer);
      }
      ref = this.model().actions();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        action = ref[i];
        if (renderAction = renderers[`render${capitalize(action)}`]) {
          actionSlot = `.kickoff-header-actions .with-custom-action-renderer-${luda.dashCase(action)}`;
          actionContainer = this.root.find(actionSlot).get(0);
          results.push(renderAction.call(this.model(), this.model(), actionContainer));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    executeCustomNavigationsRenderer: function() {
      var navigationsContainer, renderNavigations;
      ({renderNavigations} = this.customRenderers());
      if (!renderNavigations) {
        return;
      }
      navigationsContainer = this.root.find('.kickoff-header-navigations').get(0);
      return renderNavigations.call(this.model(), this.model(), navigationsContainer);
    },
    template: function() {
      return `${this.actionsTemplate()}${this.navigationsTemplate()}`;
    },
    actionsTemplate: function() {
      var action, actions, customRenderer, customRendererSlot, defaultRenderer, html, i, len, render, renderers, uid;
      [uid, renderers] = [this.model().uid, this.customRenderers()];
      if (renderers.renderActions) {
        return "<div class='kickoff-header-actions with-custom-actions-renderer'></div>";
      }
      if (!(actions = this.model().actions()).length) {
        return '';
      }
      customRendererSlot = function(action) {
        action = luda.dashCase(action);
        return `<div class='with-custom-action-renderer-${action}'></div>`;
      };
      defaultRenderer = function(action) {
        var cls;
        if (action === 'switchState') {
          return `<div class='kickoff-buttons-state-switch' data-uid='${uid}'></div>`;
        }
        if (action === 'destroyDescendants') {
          cls = 'destroy-task';
        } else if (['createTask', 'createMilestone'].includes(action)) {
          cls = luda.dashCase(action);
        }
        if (cls) {
          return `<button class='kickoff-button-${cls}' data-uid='${uid}'></button>`;
        }
        return customRendererSlot(action);
      };
      html = "";
      for (i = 0, len = actions.length; i < len; i++) {
        action = actions[i];
        customRenderer = renderers[`render${capitalize(action)}`];
        render = customRenderer ? customRendererSlot : defaultRenderer;
        html += render(action);
      }
      return `<div class='kickoff-header-actions'>${html}</div>`;
    },
    navigationsTemplate: function() {
      var renderers, tpl, uid;
      [uid, renderers] = [this.model().uid, this.customRenderers()];
      if (renderers.renderNavigations) {
        return "<div class='kickoff-header-navigations with-custom-navigations-renderer'></div>";
      }
      tpl = "<div class='kickoff-header-navigations'>";
      if (this.config().renderGantt) {
        tpl += `<div class='kickoff-buttons-unit-zoom' data-uid='${uid}'> </div>`;
      }
      if (this.config().renderTable && this.config().renderGantt) {
        tpl += `<div class='kickoff-buttons-view-switch' data-uid='${uid}'> </div>`;
      }
      tpl += "</div>";
      return tpl;
    }
  }).help({
    create: function() {
      this.render();
      return this.model().on(`after-update.${this.id}`, (event, updated) => {
        if (event.target !== this.model()) {
          return;
        }
        if (!updated.actions) {
          return;
        }
        return this.render();
      });
    },
    destroy: function() {
      var ref;
      clearTimeout(this._rendering);
      return (ref = this.model()) != null ? ref.off(`after-update.${this.id}`) : void 0;
    }
  });

  luda.component('kickoffModal').include({
    activate: function() {
      this.root.addClass('kickoff-modal-active');
      return this.root.trigger('after-activate');
    },
    deactivate: function() {
      this.root.removeClass('kickoff-modal-active');
      return this.root.trigger('after-deactivate');
    },
    toggle: function() {
      return this.root.toggleClas('kickoff-modal-active');
    }
  }).protect({
    tryDeactivate: function(event) {
      if (event.eventPath().includes(this.closeButton.get(0))) {
        return this.deactivate();
      }
      if (event.eventPath().includes(this.modalBody.get(0))) {
        return;
      }
      return this.deactivate();
    }
  }).help({
    listen: function() {
      return [['click', this.tryDeactivate]];
    },
    find: function() {
      return {
        modalBody: '.kickoff-modal-body',
        closeButton: '.kickoff-button-close-modal'
      };
    }
  });

  var clientX, clientY;

  clientX = clientY = 0;

  luda.component('kickoffProper').protect({
    action: function() {
      return this.root.data('proper-action') || 'hover';
    }
  }).protect({
    deferTime: 300
  }).protect({
    viewPortDimensions: function() {
      return {
        width: luda(window).innerWidth(),
        height: luda(window).innerHeight()
      };
    },
    selfDimensions: function() {
      return this.root.get(0).getBoundingClientRect();
    },
    popoverDimensions: function() {
      return this.popover.get(0).getBoundingClientRect();
    }
  }).include({
    activate: function(event) {
      var left, maxLeft, maxTop, popoverDimensions, selfDimensions, top, viewPortDimensions;
      if (!this.popover.length) {
        return;
      }
      if (this.root.hasClass('kickoff-proper-active')) {
        return;
      }
      this.root.addClass('kickoff-proper-preactive');
      selfDimensions = this.selfDimensions();
      popoverDimensions = this.popoverDimensions();
      viewPortDimensions = this.viewPortDimensions();
      maxLeft = viewPortDimensions.width - popoverDimensions.width;
      maxTop = viewPortDimensions.height - popoverDimensions.height;
      // left = event.clientX or selfDimensions.left
      left = clientX || selfDimensions.left;
      top = selfDimensions.bottom;
      if (left > maxLeft) {
        this.popover.addClass('kickoff-proper-popover-right').css({
          right: 0
        });
      } else {
        this.popover.addClass('kickoff-proper-popover-left').css({left});
      }
      if (top > maxTop) {
        top = selfDimensions.top - popoverDimensions.height;
        this.popover.addClass('kickoff-proper-popover-top').css({top});
      } else {
        this.popover.addClass('kickoff-proper-popover-bottom').css({top});
      }
      return this.root.removeClass('kickoff-proper-preactive').addClass('kickoff-proper-active');
    },
    deactivate: function(event) {
      if (!this.popover.length) {
        return;
      }
      if (!this.root.hasClass('kickoff-proper-active')) {
        return;
      }
      this.root.removeClass('kickoff-proper-active kickoff-proper-preactive');
      return this.popover.removeClass("kickoff-proper-popover-left kickoff-proper-popover-top kickoff-proper-popover-right kickoff-proper-popover-bottom").removeCss('left').removeCss('top').removeCss('right');
    },
    deferActivate: function(event) {
      clearTimeout(this._defer);
      return this._defer = setTimeout((() => {
        return this.activate(event);
      }), this.deferTime);
    },
    deferDeactivate: function(event) {
      clearTimeout(this._defer);
      return this._defer = setTimeout((() => {
        return this.deactivate(event);
      }), this.deferTime);
    }
  }).protect({
    mouseupActivateForHoverAction: function() {
      if (this.action() !== 'hover') {
        return;
      }
      clearTimeout(this._mousedownDeactivateDefer);
      return setTimeout((() => {
        return this.root.removeClass('kickoff-proper-tmp-hide');
      }), this.deferTime);
    },
    mousedownDeactivateForHoverAction: function(event) {
      if (this.action() !== 'hover') {
        return;
      }
      if (event && event.eventPath().includes(this.popover.get(0))) {
        return;
      }
      clearTimeout(this._mousedownDeactivateDefer);
      return this.root.addClass('kickoff-proper-tmp-hide');
    }
  }).help({
    create: function() {
      if (this.action() !== 'focus') {
        return;
      }
      if (!(this.root.attr('tabindex') >= 0)) {
        return this.root.attr('tabindex', 0);
      }
    },
    destroy: function() {
      clearTimeout(this._defer);
      this.deactivate();
      return this.mousedownDeactivateForHoverAction();
    },
    listen: function() {
      return [
        ['mouseenter focus',
        this.deferActivate],
        ['mouseleave blur',
        this.deferDeactivate],
        ['mousedown',
        this.mousedownDeactivateForHoverAction],
        ['mouseup',
        this.mouseupActivateForHoverAction],
        [
          'mousemove',
          function(event) {
            return ({clientX,
          clientY} = event);
          }
        ],
        [
          'mousewheel',
          function() {
            return luda.kickoffProper().deactivate();
          }
        ]
      ];
    },
    find: function() {
      return {
        popover: '.kickoff-proper-popover'
      };
    }
  });

  luda.component('kickoffTable').protect(modelable.all()).protect(localeable.all()).protect({
    ascTasks: function() {
      return Task.asc(...this.rootTask().descendants());
    }
  }).protect({
    template: function() {
      return `<table class='kickoff-table-content'> ${this.headTemplate()}${this.bodyTemplate()} </table>`;
    },
    headTemplate: function() {
      var column, i, len, ref, titleText, titles;
      titles = '';
      ref = this.config().tableColumns;
      for (i = 0, len = ref.length; i < len; i++) {
        column = ref[i];
        if ('title' in column) {
          titleText = column.title;
        } else {
          titleText = this.l(`task.props.${column.prop}`) || capitalize(column.prop);
        }
        titles += `<th>${titleText}</th>`;
      }
      return `<thead class='kickoff-table-header' data-uid='${this.rootTask().uid}'> <tr class='kickoff-table-header-row'>${titles}</tr> </thead>`;
    },
    bodyTemplate: function() {
      return `<tbody class='kickoff-table-tasks' data-uid='${this.rootTask().uid}'></tbody>`;
    },
    taskTemplate: function(task) {
      return `<tr class='kickoff-table-task' data-uid='${task.uid}'></tr>`;
    },
    render: function() {
      this.root.html(this.template());
      return this.insertTaskDoms();
    }
  }).protect({
    tasksContainerDom: function() {
      return this.root.find('.kickoff-table-tasks');
    },
    findTaskDom: function(task) {
      return this.tasksContainerDom().find(`.kickoff-table-task[data-uid='${task.uid}']`);
    },
    insertTaskDom: function(task) {
      var d, rowIndex, taskRow;
      if ((d = this.findTaskDom(task)).length) {
        return luda.kickoffTableTask(d).render();
      }
      task.one(`after-render-in-table.${this.id}`, () => {
        var node;
        node = this.findTaskDom(task).get(0);
        if (node.scrollIntoViewIfNeeded) {
          return node.scrollIntoViewIfNeeded();
        } else {
          return node.scrollIntoView();
        }
      });
      rowIndex = this.ascTasks().indexOf(task);
      taskRow = luda(this.tasksContainerDom().get(0).insertRow(rowIndex));
      return taskRow.prop('outerHTML', this.taskTemplate(task));
    },
    removeTaskDom: function(task) {
      return this.findTaskDom(task).remove();
    },
    insertTaskDoms: function() {
      return this.tasksContainerDom().html(this.ascTasks().map((t) => {
        return this.taskTemplate(t);
      }).join(''));
    }
  }).help({
    create: function() {
      this.rootTask().on(`after-create.${this.id}`, (event) => {
        if (event.target.isRoot()) {
          return;
        }
        return this.insertTaskDom(event.target);
      });
      this.rootTask().on(`after-destroy.${this.id}`, (event) => {
        if (event.target.isRoot()) {
          return;
        }
        return this.removeTaskDom(event.target);
      });
      return this.render();
    },
    destroy: function() {
      var ref, ref1;
      if ((ref = this.rootTask()) != null) {
        ref.off(`after-create.${this.id}`);
      }
      return (ref1 = this.rootTask()) != null ? ref1.off(`after-destroy.${this.id}`) : void 0;
    }
  });

  luda.component('kickoffTableTask').protect(modelable.all()).protect(localeable.all()).include({
    render: function() {
      clearTimeout(this._rendering);
      return this._rendering = setTimeout(() => {
        var model;
        if (!(model = this.model())) {
          return;
        }
        this.root.html(this.template());
        this.setCls();
        this.executeCustomRenderers();
        return model.trigger('after-render-in-table');
      });
    }
  }).protect({
    template: function() {
      var model;
      model = this.model();
      return this.config().tableColumns.map((column) => {
        var dashedProp, hasCustomRender, html, prop, render, tplName;
        ({prop, render} = column);
        dashedProp = luda.dashCase(prop);
        hasCustomRender = luda.isFunction(render);
        hasCustomRender || (hasCustomRender = prop === 'actions' && this.customRenderers().renderActions);
        if (hasCustomRender) {
          html = `<div class='with-custom-${dashedProp}-renderer'></div>`;
        } else {
          tplName = `${prop}Template`;
          html = tplName in this ? this[tplName](column) : model.data[prop];
          if (html == null) {
            html = '';
          }
        }
        return `<td data-prop='${prop}'>${html}</td>`;
      }).join('');
    },
    typeTemplate: function(column = {}) {
      return this.l(`task.types.${this.model().data.type}`);
    },
    durationTemplate: function(column = {}) {
      var dayCount;
      dayCount = Math.round(this.model().duration().days);
      return `${dayCount} ${this.l('task.durationUnits.day')}`;
    },
    predecessorsTemplate: function(column = {}) {
      return this.model().deps().map(function(depc) {
        return depc.data.wbs;
      }).join(', ');
    },
    successorsTemplate: function(column = {}) {
      return this.model().depd().map(function(depd) {
        return depd.data.wbs;
      }).join(', ');
    },
    actionsTemplate: function(column = {}) {
      var action, actions, customRenderer, customRendererSlot, defaultRenderer, html, i, len, model, render, renderers, uid;
      [model, renderers] = [this.model(), this.customRenderers()];
      [uid, actions] = [model.uid, model.actions()];
      if (!actions.length) {
        return '';
      }
      customRendererSlot = function(action) {
        return `<div class='with-custom-action-renderer-${luda.dashCase(action)}'></div>`;
      };
      defaultRenderer = function(action) {
        var cls;
        if (['pick', 'fold', 'destroy'].includes(action)) {
          cls = `${action}-task`;
        } else if (action === 'update') {
          cls = 'edit-task';
        } else if (['createTask', 'createMilestone'].includes(action)) {
          cls = luda.dashCase(action);
        }
        if (cls) {
          return `<button class='kickoff-button-${cls}' data-uid='${uid}'></button>`;
        } else {
          return customRendererSlot(action);
        }
      };
      html = "";
      for (i = 0, len = actions.length; i < len; i++) {
        action = actions[i];
        customRenderer = renderers[`renderAction${capitalize(action)}`];
        render = customRenderer ? customRendererSlot : defaultRenderer;
        html += render(action);
      }
      return html;
    }
  }).protect({
    setCls: function() {
      var oldHidden;
      oldHidden = Boolean(this._isHidden);
      this._isHidden = Boolean(this.model().isHidden);
      this.root.toggleClass('is-picked', Boolean(this.model().isPicked));
      this.root.toggleClass('is-milestone', this.model().isMilestone());
      this.root.toggleClass('is-task', this.model().isTask());
      this.root.toggleClass('is-folded', Boolean(this.model().isFolded));
      this.root.toggleClass('is-hidden', this._isHidden);
      if (oldHidden === this._isHidden) {
        return;
      }
      return this.model().trigger('after-toggle-in-table', this._isHidden);
    },
    customRenderers: function() {
      var action, actionTypes, cap, configRendererName, customActionsRenderer, customRenderer, i, len, modelType, renderers, t;
      [renderers, modelType] = [{}, capitalize(this.model().type())];
      customActionsRenderer = this.config()[`renderTable${modelType}Actions`];
      if (customActionsRenderer) {
        renderers.renderActions = customActionsRenderer;
      }
      actionTypes = (function() {
        var i, len, ref, results;
        ref = this.model().actions();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          action = ref[i];
          results.push(action);
        }
        return results;
      }).call(this);
      for (i = 0, len = actionTypes.length; i < len; i++) {
        t = actionTypes[i];
        cap = capitalize(t);
        configRendererName = `renderTable${modelType}Action${cap}`;
        customRenderer = this.config()[configRendererName];
        if (!taskActions.includes(t)) {
          if (!customRenderer) {
            console.error(`Custom action ${t} is defined, but ${configRendererName} is not defined.`);
          }
        }
        if (customRenderer) {
          renderers[`renderAction${cap}`] = customRenderer;
        }
      }
      return renderers;
    },
    executeCustomRenderers: function() {
      var column, container, i, len, prop, ref, render, results, selector;
      ref = this.config().tableColumns;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        column = ref[i];
        ({prop, render} = column);
        if (prop === 'actions') {
          results.push(this.executeCustomActionRenderers(column));
        } else if (render) {
          selector = `.with-custom-${luda.dashCase(prop)}-renderer`;
          container = this.root.find(selector).get(0);
          results.push(render.call(this.model(), this.model(), container));
        } else {
          results.push(void 0);
        }
      }
      return results;
    },
    executeCustomActionRenderers: function(column = {}) {
      var action, actionContainer, actionSlot, actionsContainer, i, len, ref, renderAction, renderActions, renderers, results;
      renderers = this.customRenderers();
      renderActions = column.render || renderers.renderActions;
      this.root.toggleClass('with-custom-actions-renderer', Boolean(renderActions));
      if (renderActions) {
        if (this.model().isHidden) {
          return;
        }
        actionsContainer = this.root.find('.with-custom-actions-renderer').get(0);
        return renderActions.call(this.model(), this.model(), actionsContainer);
      }
      ref = this.model().actions();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        action = ref[i];
        if (renderAction = renderers[`renderAction${capitalize(action)}`]) {
          actionSlot = `.with-custom-action-renderer-${luda.dashCase(action)}`;
          actionContainer = this.root.find(actionSlot).get(0);
          results.push(renderAction.call(this.model(), this.model(), actionContainer));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  }).help({
    create: function() {
      var model;
      if (!(model = this.model())) {
        return;
      }
      this.render();
      return model.on(`after-update.${this.id}`, (event, updated) => {
        if (model === event.target) {
          return this.render();
        }
      });
    },
    destroy: function() {
      var ref;
      clearTimeout(this._rendering);
      return (ref = this.model()) != null ? ref.off(`after-update.${this.id}`) : void 0;
    }
  });

  var TimelineEvent, addEvent$1, addEventOnce$1, eventCache$1, removeEvent$1, triggerEvent$1;

  TimelineEvent = class TimelineEvent extends CustomEvent$1 {};

  eventCache$1 = function(timeline, type) {
    var cache;
    cache = timeline.events;
    return cache[type] || (cache[type] = []);
  };

  addEvent$1 = function(timeline, event, callback, _one = false) {
    var namespace, type;
    mustBeTimeline(timeline);
    ({type, namespace} = parseEvent(event));
    mustBeValidCallback(callback);
    return eventCache$1(timeline, type).push({namespace, callback, _one});
  };

  addEventOnce$1 = function(timeline, event, callback) {
    return addEvent$1(timeline, event, callback, true);
  };

  removeEvent$1 = function(timeline, event, callback) {
    var i, len, namespace, results, type, types;
    mustBeTimeline(timeline);
    if (event) {
      ({type, namespace} = parseEvent(event));
    }
    if (callback) {
      mustBeValidCallback(callback);
    }
    eventCache$1(timeline, type);
    types = type ? [type] : Object.keys(timeline.events);
    results = [];
    for (i = 0, len = types.length; i < len; i++) {
      type = types[i];
      results.push(timeline.events[type] = eventCache$1(timeline, type).filter(function(q) {
        if (callback && callback !== q.callback) {
          return true;
        }
        if (namespace && namespace.length && !nsMatches(namespace, q.namespace)) {
          return true;
        }
      }));
    }
    return results;
  };

  triggerEvent$1 = function(timeline, event, detail) {
    var namespace, timelineEvent, type;
    mustBeTimeline(timeline);
    if (!timeline.created) {
      return;
    }
    ({type, namespace} = parseEvent(event));
    timelineEvent = new TimelineEvent(timeline, event, detail);
    timelineEvent.currentTarget = timeline;
    eventCache$1(timeline, type).some(function(q) {
      if (!nsMatches(namespace, q.namespace)) {
        return;
      }
      if (q.callback.call(timeline, timelineEvent, timelineEvent.detail) === false) {
        timelineEvent.stopPropagation();
        timelineEvent.preventDefault();
      }
      if (q._one) {
        removeEvent$1(timeline, event, q.callback);
      }
      return timelineEvent.isImmediatePropagationStopped();
    });
    return !timelineEvent.isDefaultPrevented();
  };

  Timeline.prototype.on = function(event, callback) {
    addEvent$1(this, event, callback);
    return this;
  };

  Timeline.prototype.one = function(event, callback) {
    addEventOnce$1(this, event, callback);
    return this;
  };

  Timeline.prototype.off = function(event, callback) {
    removeEvent$1(this, event, callback);
    return this;
  };

  Timeline.prototype.trigger = function(event, detail) {
    triggerEvent$1(this, event, detail);
    return this;
  };

  var avaliableUnits, mustBeValidUnit, unit$2, units;

  units = ['hour', 'day', 'week', 'month', 'year'];

  avaliableUnits = function() {
    return units;
  };

  mustBeValidUnit = function(unit) {
    if (!units.includes(unit)) {
      throw new Error('unit must be one of hour, day, week, month and year');
    }
  };

  unit$2 = function(timeline, newUnit) {
    var detail, newVal, oldVal;
    mustBeTimeline(timeline);
    oldVal = timeline._unit;
    if (!newUnit) {
      return oldVal;
    }
    mustBeValidUnit(newUnit);
    newVal = timeline._unit = newUnit;
    detail = {
      unit: {oldVal, newVal}
    };
    triggerEvent$1(timeline, 'after-touch', detail);
    if (newVal !== oldVal) {
      return triggerEvent$1(timeline, 'after-update', detail);
    }
  };

  Timeline.prototype.unit = function(newUnit) {
    var result;
    result = unit$2(this, newUnit);
    if (!newUnit) {
      return result;
    }
    return this;
  };

  Timeline.avaliableUnits = avaliableUnits;

  Timeline.prototype.avaliableUnits = function() {
    return avaliableUnits();
  };

  var beginning$1, beginningIncludePadding;

  beginningIncludePadding = function(timeline, beginVal) {
    var m;
    mustBeTimeline(timeline);
    m = Time.methodNames(unit$2(timeline));
    return new Time(beginVal)[m.prevUnit](timeline._padding)[m.beginningOfUnit]();
  };

  beginning$1 = function(timeline, newBegin) {
    var detail, newVal, oldVal;
    mustBeTimeline(timeline);
    oldVal = timeline._beginning;
    if (!newBegin) {
      return oldVal;
    }
    newVal = timeline._beginning = beginningIncludePadding(timeline, newBegin);
    detail = {
      beginning: {oldVal, newVal}
    };
    triggerEvent$1(timeline, 'after-touch', detail);
    if (!newVal.equals(oldVal)) {
      return triggerEvent$1(timeline, 'after-update', detail);
    }
  };

  Timeline.prototype.beginning = function(newBegin) {
    var result;
    result = beginning$1(this, newBegin);
    if (!newBegin) {
      return result;
    }
    return this;
  };

  var create$2;

  create$2 = function(...args) {
    return new Timeline(...args);
  };

  Timeline.create = create$2;

  var end$1, endIncludePadding;

  endIncludePadding = function(timeline, endVal) {
    var begin, beginNoPadding, leastRange, m, padding, range;
    mustBeTimeline(timeline);
    m = Time.methodNames(unit$2(timeline));
    endVal = new Time(endVal)[m.endOfUnit]();
    begin = beginning$1(timeline);
    padding = timeline._padding;
    beginNoPadding = begin[m.nextUnit](padding)[m.beginningOfUnit]();
    range = endVal.since(beginNoPadding)[`${unit$2(timeline)}s`];
    leastRange = timeline._leastRange;
    if (range < leastRange) {
      endVal = beginNoPadding[m.nextUnit](leastRange);
    }
    return endVal[m.nextUnit](padding)[m.endOfUnit]();
  };

  end$1 = function(timeline, newEnd) {
    var detail, newVal, oldVal;
    mustBeTimeline(timeline);
    oldVal = timeline._end;
    if (!newEnd) {
      return oldVal;
    }
    newVal = timeline._end = endIncludePadding(timeline, newEnd);
    detail = {
      end: {oldVal, newVal}
    };
    triggerEvent$1(timeline, 'after-touch', detail);
    if (!newVal.equals(oldVal)) {
      return triggerEvent$1(timeline, 'after-update', detail);
    }
  };

  Timeline.prototype.end = function(newEnd) {
    var result;
    result = end$1(this, newEnd);
    if (!newEnd) {
      return result;
    }
    return this;
  };

  var duration$1;

  duration$1 = function(timeline, secs) {
    var newEnd;
    mustBeTimeline(timeline);
    if (!secs) {
      return end$1(timeline).since(beginning$1(timeline));
    }
    newEnd = beginning$1(timeline).nextSecond(secs);
    return end$1(timeline, newEnd);
  };

  Timeline.prototype.duration = function(secs) {
    var result;
    result = duration$1(this, secs);
    if (secs == null) {
      return result;
    }
    return this;
  };

  var fit;

  fit = function(timeline, beginVal, endVal, mode = 'both') {
    var beginSame, c, currentBegin, currentEnd, endSame, newBegin, newEnd, shouldUpdate, unitSame;
    mustBeTimeline(timeline);
    c = timeline._fitCache || (timeline._fitCache = {});
    unitSame = c.unit === timeline._unit;
    beginSame = c.beginVal === beginVal;
    beginSame || (beginSame = new Time(c.beginVal).equals(new Time(beginVal)));
    endSame = c.endVal === endVal;
    endSame || (endSame = new Time(c.endVal).equals(new Time(endVal)));
    if (unitSame && beginSame && endSame) {
      return false;
    }
    if (mode !== 'both') {
      [currentBegin, currentEnd] = [beginning$1(timeline), end$1(timeline)];
      newBegin = beginningIncludePadding(timeline, beginVal);
      newEnd = endIncludePadding(timeline, endVal);
      if (mode === 'grow') {
        shouldUpdate = currentBegin.laterThan(newBegin);
        shouldUpdate || (shouldUpdate = currentEnd.earlierThan(newEnd));
      } else if (mode === 'shrink') {
        shouldUpdate = currentBegin.earlierThan(newBegin);
        shouldUpdate || (shouldUpdate = currentEnd.laterThan(newEnd));
      } else {
        throw new Error(`Invalid mode: ${mode}`);
      }
      if (!shouldUpdate) {
        return false;
      }
    }
    timeline._fitCache = {
      beginVal,
      endVal,
      unit: timeline._unit
    };
    beginning$1(timeline, beginVal);
    end$1(timeline, endVal);
    return true;
  };

  Timeline.prototype.fit = function(beginVal, endVal, mode) {
    return fit(this, beginVal, endVal, mode);
  };

  var coincidentRanges, days, excludedRanges, flagsInRange, hours, includedRanges, months, weeks, years;

  years = function(timeline) {
    var beginTime, endTime;
    mustBeTimeline(timeline);
    [beginTime, endTime] = [beginning$1(timeline), end$1(timeline)];
    return Time.devideByYear(beginTime, endTime).map(function(year) {
      return Object.assign(year, {
        unit: 'year',
        depth: 0,
        label: year.beginning.year,
        inclusions: includedRanges(timeline, year),
        exclusions: excludedRanges(timeline, year),
        flags: flagsInRange(timeline, year)
      });
    });
  };

  months = function(timeline) {
    var beginTime, endTime, i, len, month, ref, units, year;
    mustBeTimeline(timeline);
    [year, units] = [-1, []];
    [beginTime, endTime] = [beginning$1(timeline), end$1(timeline)];
    ref = Time.devideByMonth(beginTime, endTime);
    for (i = 0, len = ref.length; i < len; i++) {
      month = ref[i];
      if (year !== month.beginning.year) {
        year = month.beginning.year;
        units.push({
          unit: 'year',
          depth: 0,
          label: year,
          groups: [],
          beginning: month.beginning.beginningOfTheYear(),
          end: month.beginning.endOfTheYear()
        });
      }
      units[units.length - 1].groups.push(Object.assign(month, {
        unit: 'month',
        depth: 1,
        label: month.beginning.month,
        inclusions: includedRanges(timeline, month),
        exclusions: excludedRanges(timeline, month),
        flags: flagsInRange(timeline, month)
      }));
    }
    return units;
  };

  weeks = function(timeline) {
    var beginTime, endTime, i, index, len, splited, toBePushed, units, week, weekAssignments, year;
    mustBeTimeline(timeline);
    [year, units] = [-1, []];
    [beginTime, endTime] = [beginning$1(timeline), end$1(timeline)];
    splited = Time.devideByWeek(beginTime, endTime);
    for (index = i = 0, len = splited.length; i < len; index = ++i) {
      week = splited[index];
      if (year !== week.beginning.year) {
        year = week.beginning.year;
        units.push({
          unit: 'year',
          depth: 0,
          label: year,
          groups: [],
          beginning: week.beginning.beginningOfTheYear(),
          end: week.beginning.endOfTheYear()
        });
      }
      weekAssignments = {
        unit: 'week',
        depth: 1,
        label: week.beginning.weekOfTheYear()
      };
      if (week.beginning.year !== week.end.year) {
        weekAssignments.end = week.beginning.endOfTheYear();
        splited.splice(index + 1, 0, {
          beginning: week.end.beginningOfTheYear(),
          end: week.end
        });
      }
      toBePushed = Object.assign(week, weekAssignments);
      toBePushed.inclusions = includedRanges(timeline, toBePushed);
      toBePushed.exclusions = excludedRanges(timeline, toBePushed);
      toBePushed.flags = flagsInRange(timeline, toBePushed);
      units[units.length - 1].groups.push(toBePushed);
    }
    return units;
  };

  days = function(timeline) {
    var _monthLabel, beginTime, day, endTime, i, len, monthLabel, ref, units;
    mustBeTimeline(timeline);
    [monthLabel, units] = ['', []];
    [beginTime, endTime] = [beginning$1(timeline), end$1(timeline)];
    ref = Time.devideByDay(beginTime, endTime);
    for (i = 0, len = ref.length; i < len; i++) {
      day = ref[i];
      _monthLabel = day.beginning.toString('{yyyy}-{mm}');
      if (monthLabel !== _monthLabel) {
        monthLabel = _monthLabel;
        units.push({
          unit: 'month',
          depth: 0,
          label: monthLabel,
          groups: [],
          beginning: day.beginning.beginningOfTheMonth(),
          end: day.beginning.endOfTheMonth()
        });
      }
      units[units.length - 1].groups.push(Object.assign(day, {
        unit: 'day',
        depth: 1,
        label: day.beginning.day,
        isWeekend: day.beginning.isWeekend(),
        inclusions: includedRanges(timeline, day),
        exclusions: excludedRanges(timeline, day),
        flags: flagsInRange(timeline, day)
      }));
    }
    return units;
  };

  hours = function(timeline) {
    var _dayLabel, beginTime, dayLabel, endTime, hour, i, len, ref, units;
    mustBeTimeline(timeline);
    [dayLabel, units] = ['', []];
    [beginTime, endTime] = [beginning$1(timeline), end$1(timeline)];
    ref = Time.devideByHour(beginTime, endTime);
    for (i = 0, len = ref.length; i < len; i++) {
      hour = ref[i];
      _dayLabel = hour.beginning.toString('{yyyy}-{mm}-{dd}');
      if (dayLabel !== _dayLabel) {
        dayLabel = _dayLabel;
        units.push({
          unit: 'day',
          depth: 0,
          label: dayLabel,
          groups: [],
          beginning: hour.beginning.beginningOfTheDay(),
          end: hour.beginning.endOfTheDay()
        });
      }
      units[units.length - 1].groups.push(Object.assign(hour, {
        unit: 'hour',
        depth: 1,
        label: hour.beginning.hours,
        inclusions: includedRanges(timeline, hour),
        exclusions: excludedRanges(timeline, hour),
        flags: flagsInRange(timeline, hour)
      }));
    }
    return units;
  };

  coincidentRanges = function(rangeArr = [], range) {
    var coincidents;
    coincidents = [];
    rangeArr.forEach(function(t) {
      var b, e, tBegin, tEnd;
      [tBegin, tEnd] = [new Time(t.beginning), new Time(t.end)];
      if (!tBegin.earlierThan(range.end)) {
        return;
      }
      if (!tEnd.laterThan(range.beginning)) {
        return;
      }
      b = tBegin.earlierThan(range.beginning) ? range.beginning : tBegin;
      e = tEnd.laterThan(range.end) ? range.end : tEnd;
      return coincidents.push({
        beginning: b,
        end: e
      });
    });
    return coincidents;
  };

  includedRanges = function(timeline, range) {
    mustBeTimeline(timeline);
    return coincidentRanges(timeline._inclusions, range);
  };

  excludedRanges = function(timeline, range) {
    mustBeTimeline(timeline);
    return coincidentRanges(timeline._exclusions, range);
  };

  flagsInRange = function(timeline, range) {
    mustBeTimeline(timeline);
    return timeline._flags.filter(function(t) {
      if (range.beginning.laterThan(t.time)) {
        return false;
      }
      if (range.end.earlierThan(t.time)) {
        return false;
      }
      return true;
    }).map(function(flag) {
      return Object.assign({}, flag, {
        time: new Time(flag.time)
      });
    });
  };

  Timeline.prototype.years = function() {
    return years(this);
  };

  Timeline.prototype.months = function() {
    return months(this);
  };

  Timeline.prototype.weeks = function() {
    return weeks(this);
  };

  Timeline.prototype.days = function() {
    return days(this);
  };

  Timeline.prototype.hours = function() {
    return hours(this);
  };

  var update$1;

  update$1 = function(timeline, data = {}) {
    mustBeTimeline(timeline);
    throw new Error("Not implemmented");
  };

  Timeline.prototype.update = function(data) {
    update$1(this, data);
    return this;
  };

  var Kickoff, kickoff;

  Kickoff = class Kickoff {
    constructor(conf = {}, tasks = []) {
      var config, root, timeline;
      this.node = luda(conf.target);
      if (!this.node.length) {
        throw new Error(`No HTML element detected by: ${conf.target}`);
      }
      if (this.node.length > 1) {
        console.warn("Models are shared among multiple kickoff components");
      }
      if (this.node.hasClass('kickoff')) {
        ({root, timeline, config} = store.relations(this.node.data('uid')));
        [this.task, this.timeline, this.config] = [root, timeline, config];
        console.warn("The kickoff instance being constructed has already been initialized. You don't have to construct it again. If you need rerender it, use the `render` method. For reconfiguring, use the `configure` method. If it's really necessary to reconstruct the instance, please call the `destroy` method first, then construct a new instance.");
        return this;
      }
      conf = this.configure(conf, true);
      this.task = Task.create(conf.task);
      this.task.create(...tasks);
      if (tasks.length) {
        this.task.popUndoState();
      }
      this.timeline = Timeline.create(conf.timeline);
      store.create(this.task, this.timeline, this.config);
      this.render();
    }

    render() {
      var rootCls, tpl;
      tpl = `<main class='kickoff-main' data-uid='${this.task.uid}'>`;
      if (this.config.renderHeader) {
        tpl += `<header class='kickoff-header' data-uid='${this.task.uid}'></header>`;
      }
      if (this.config.renderGantt) {
        tpl += `<div class='kickoff-gantt' data-uid='${this.task.uid}'></div>`;
      }
      if (this.config.renderTable) {
        tpl += `<div class='kickoff-table' data-uid='${this.task.uid}'></div>`;
      }
      tpl += "</main>";
      rootCls = 'kickoff';
      if (this.config.renderTable && !this.config.renderGantt) {
        rootCls += ' view-switch-to-table';
      }
      this.node.addClass(rootCls).data('uid', this.task.uid).html(tpl);
      return this;
    }

    configure(conf = {}, _returnSplited) {
      var isCreated, splitedReturnValue, taskConf, timelineConf, uiConf;
      delete conf.uid;
      isCreated = this.task && this.timeline;
      if (isCreated && Object.keys(conf).length === 0) {
        return this;
      }
      if (!isCreated) {
        this.config = {
          uid: luda.guid()
        };
      }
      Object.assign(this.config, (taskConf = this._taskConf(conf)), (timelineConf = this._timelineConf(conf)), (uiConf = this._uiConf(conf)));
      splitedReturnValue = {
        task: taskConf,
        timeline: timelineConf,
        ui: uiConf
      };
      if (!isCreated) {
        if (_returnSplited) {
          return splitedReturnValue;
        } else {
          return this;
        }
      }
      this.node.html('');
      this.task.update(taskConf);
      this.timeline.update(timelineConf);
      this.render();
      if (_returnSplited) {
        return splitedReturnValue;
      } else {
        return this;
      }
    }

    destroy() {
      var key, results, uid;
      uid = this.task.uid;
      this.node.html('').removeClass('kickoff').data('uid', null);
      store.destroy(uid);
      results = [];
      for (key in this) {
        results.push(delete this[key]);
      }
      return results;
    }

    _taskConf(conf = {}) {
      var config;
      config = {
        exclusions: [],
        excludeWeekends: true,
        inclusions: [],
        minDurationSeconds: 3600 * 24,
        maxHistorySize: 2e308,
        actions: ['createTask', 'createMilestone', 'destroyDescendants', 'switchState']
      };
      this._mergeConf(config, conf);
      return config;
    }

    _timelineConf(conf = {}) {
      var config;
      config = {
        exclusions: [],
        excludeWeekends: true,
        inclusions: [],
        flags: []
      };
      this._mergeConf(config, conf);
      return config;
    }

    _uiConf(conf = {}) {
      var config, key, modelConfKeys, val;
      config = {
        resizeRenderDelay: 1000,
        renderHeader: true,
        renderHeaderActions: null,
        renderHeaderNavigations: null,
        renderHeaderActionCreateTask: null,
        renderHeaderActionCreateMilestone: null,
        renderHeaderActionDestroyDescendants: null,
        renderHeaderActionSwitchState: null,
        renderGantt: true,
        renderGanttTaskGraph: null,
        renderGanttTaskSummary: null,
        renderGanttTaskActions: null,
        renderGanttTaskActionPick: null,
        renderGanttTaskActionFold: null,
        renderGanttTaskActionUpdate: null,
        renderGanttTaskActionDestroy: null,
        renderGanttTaskActionCreateTask: null,
        renderGanttTaskActionCreateMilestone: null,
        renderGanttTaskLinkActions: null,
        renderGanttMilestoneGraph: null,
        renderGanttMilestoneSummary: null,
        renderGanttMilestoneActions: null,
        renderGanttMilestoneActionPick: null,
        renderGanttMilestoneActionUpdate: null,
        renderGanttMilestoneActionDestroy: null,
        renderGanttMilestoneLinkActions: null,
        tableColumns: [
          {
            prop: 'actions',
            render: null
          },
          {
            prop: 'wbs',
            render: null
          },
          {
            prop: 'type',
            render: null
          },
          {
            prop: 'name',
            render: null
          },
          {
            prop: 'beginning',
            render: null
          },
          {
            prop: 'end',
            render: null
          },
          {
            prop: 'duration',
            render: null
          },
          {
            prop: 'predecessors',
            render: null
          },
          {
            prop: 'successors',
            render: null
          }
        ],
        renderTable: true,
        renderTableTaskActions: null,
        renderTableTaskActionPick: null,
        renderTableTaskActionFold: null,
        renderTableTaskActionUpdate: null,
        renderTableTaskActionDestroy: null,
        renderTableTaskActionCreateTask: null,
        renderTableTaskActionCreateMilestone: null,
        renderTableMilestoneActions: null,
        renderTableMilestoneActionPick: null,
        renderTableMilestoneActionUpdate: null,
        renderTableMilestoneActionDestroy: null,
        // If the render property is defined:
        // 1. If the data type of the filed value need be converted,
        //    the convertion should be fullfilled by the custom render.
        // 2. The options property of a select type editor is ignored.
        // else
        // 1. Field value type convertion can be automatically fullfiled according
        //    to the type property and enum value types of the options property
        // 2. The options property of a select type editor can be an array
        //    or a function with a param named 'use' which is a function will be
        //    called to fill the select options.
        renderTaskForm: null,
        renderMilestoneForm: null,
        formFields: [
          {
            prop: 'wbs',
            type: 'text',
            placeholder: 'E.g., 1.1',
            render: null
          },
          {
            prop: 'name',
            type: 'text',
            placeholder: 'E.g., A New Task',
            render: null
          },
          {
            prop: 'beginning',
            type: 'time',
            placeholder: 'E.g., 2020/01/01',
            render: null
          },
          {
            prop: 'end',
            type: 'time',
            placeholder: 'E.g., 2020/01/02',
            render: null
          },
          {
            prop: 'predecessors',
            render: null,
            fields: [
              {
                prop: 'predecessors.startToStart',
                type: 'select',
                multiple: true,
                options: [],
                placeholder: 'E.g., 1, 2',
                render: null
              },
              {
                prop: 'predecessors.startToFinish',
                type: 'select',
                multiple: true,
                options: [],
                placeholder: 'E.g., 3, 4',
                render: null
              },
              {
                prop: 'predecessors.finishToFinish',
                type: 'select',
                multiple: true,
                options: [],
                placeholder: 'E.g., 5, 6',
                render: null
              },
              {
                prop: 'predecessors.finishToStart',
                type: 'select',
                multiple: true,
                options: [],
                placeholder: 'E.g., 7, 8',
                render: null
              }
            ]
          },
          {
            prop: 'successors',
            render: null,
            fields: [
              {
                prop: 'successors.startToStart',
                type: 'select',
                multiple: true,
                options: [],
                placeholder: 'E.g., 1, 2',
                render: null
              },
              {
                prop: 'successors.startToFinish',
                type: 'select',
                multiple: true,
                options: [],
                placeholder: 'E.g., 3, 4',
                render: null
              },
              {
                prop: 'successors.finishToFinish',
                type: 'select',
                multiple: true,
                options: [],
                placeholder: 'E.g., 5, 6',
                render: null
              },
              {
                prop: 'successors.finishToStart',
                type: 'select',
                multiple: true,
                options: [],
                placeholder: 'E.g., 7, 8',
                render: null
              }
            ]
          }
        ],
        locale: {
          header: {
            actions: {
              undo: 'Undo',
              redo: 'Redo'
            },
            navigations: {
              zoomIn: 'Zoom In',
              zoomOut: 'Zoom Out',
              zoomUnits: {
                year: 'Year',
                month: 'Month',
                week: 'Week',
                day: 'Day',
                hour: 'Hour'
              },
              chartView: 'Chart View',
              tableView: 'Table View'
            }
          },
          task: {
            types: {
              task: 'Task',
              milestone: 'Milestone'
            },
            actions: {
              createTask: 'New Task',
              createMilestone: 'New Milestone',
              destroyDescendants: 'Destroy Items',
              createSubTask: 'Create a sub task',
              createSubMilestone: 'Create a sub milestone',
              updateTask: 'Edit this task',
              updateMilestone: 'Edit this milestone',
              destroyTask: 'Destroy this task',
              destroyMilestone: 'Destroy this milestone',
              pick: 'Pick this item',
              unpick: 'Unpick this item',
              fold: 'Fold descendants',
              unfold: 'Unfold descendants'
            },
            props: {
              wbs: 'Wbs',
              name: 'Name',
              type: 'Type',
              beginning: 'Beginning',
              end: 'End',
              time: 'Time',
              duration: 'Duration',
              predecessors: {
                $: 'Predecessors',
                startToStart: 'Start to Start',
                startToFinish: 'Start to Finish',
                finishToFinish: 'Finish to Finish',
                finishToStart: 'Finish to Start'
              },
              successors: {
                $: 'Successors',
                startToStart: 'Start to Start',
                startToFinish: 'Start to Finish',
                finishToFinish: 'Finish to Finish',
                finishToStart: 'Finish to Start'
              },
              actions: 'Actions',
              readonlyProps: 'Readonly Properties'
            },
            durationUnits: {
              year: 'years',
              month: 'months',
              week: 'weeks',
              day: 'days',
              hour: 'hours'
            }
          }
        }
      };
      modelConfKeys = Object.keys(this._taskConf()).concat(Object.keys(this._timelineConf()));
      for (key in conf) {
        val = conf[key];
        if (!(key === 'locale' || modelConfKeys.includes(key))) {
          config[key] = val;
        }
      }
      this._mergeLocaleConf(config.locale, conf.locale);
      return config;
    }

    _mergeLocaleConf(defaultConf, custom) {
      var key, results, val;
      if (!custom) {
        return defaultConf;
      }
      for (key in defaultConf) {
        val = defaultConf[key];
        if (typeof val === 'string') {
          if (key in custom) {
            defaultConf[key] = custom[key];
          }
        } else {
          this._mergeLocaleConf(defaultConf[key], custom[key]);
        }
      }
      results = [];
      for (key in custom) {
        val = custom[key];
        if (!(key in defaultConf)) {
          results.push(defaultConf[key] = custom[key]);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

    _mergeConf(defaultConf, custom) {
      var key, results;
      results = [];
      for (key in defaultConf) {
        if (key in custom) {
          results.push(defaultConf[key] = custom[key]);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

  };

  kickoff = function(...args) {
    return new Kickoff(...args);
  };

  [['time', Time]].forEach(function(item) {
    var Con, key, name, results, val;
    [name, Con] = [item[0], item[1]];
    kickoff[name] = function(...args) {
      return new Con(...args);
    };
    results = [];
    for (key in Con) {
      val = Con[key];
      results.push(kickoff[name][key] = typeof val === 'function' ? val.bind(Con) : val);
    }
    return results;
  });

  kickoff.asc = Task.asc;

  kickoff.desc = Task.desc;

  window.kickoff || (window.kickoff = kickoff);

  var createEvent, endTarget, hoverTarget, mousedownHandler, mousemoveHandler, mouseupHandler, reset, target, timestamp, triggerDelay, triggered;

  triggerDelay = 100;

  timestamp = null;

  triggered = false;

  target = null;

  hoverTarget = null;

  endTarget = null;

  reset = function() {
    timestamp = null;
    triggered = false;
    target = null;
    hoverTarget = null;
    return endTarget = null;
  };

  createEvent = function(name, originalEvent) {
    var event, i, key, len, props;
    props = ['screenX', 'screenY', 'clientX', 'clientY', 'pageX', 'pageY'];
    event = new CustomEvent(name, {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    event.startTarget = target;
    event.hoverTarget = hoverTarget;
    event.endTarget = endTarget;
    for (i = 0, len = props.length; i < len; i++) {
      key = props[i];
      event[key] = originalEvent[key];
    }
    return event;
  };

  mousedownHandler = function(e) {
    reset();
    if (e.isDefaultPrevented()) {
      return;
    }
    target = e.target;
    return timestamp = Date.now();
  };

  mousemoveHandler = function(e) {
    var ev;
    if (e.isDefaultPrevented()) {
      return;
    }
    if (triggered) {
      hoverTarget = e.target;
      return luda(target).trigger(createEvent('dragging', e));
    }
    if (!timestamp) {
      return;
    }
    triggered = Date.now() - timestamp >= triggerDelay;
    if (!triggered) {
      return reset();
    }
    ev = luda(target).trigger(createEvent('draggingstart', e), null, true)[0];
    if (ev.isDefaultPrevented()) {
      return reset();
    }
    return mousemoveHandler(e);
  };

  mouseupHandler = function(e) {
    if (!triggered) {
      return reset();
    }
    if (e.isDefaultPrevented()) {
      return reset();
    }
    endTarget = e.target;
    luda(target).trigger(createEvent('draggingend', e));
    return reset();
  };

  luda(document).on('mousedown.simulateddrag', mousedownHandler);

  luda(document).on('mousemove.simulateddrag', mousemoveHandler);

  luda(document).on('mouseup.simulateddrag', mouseupHandler);

})));
//# sourceMappingURL=kickoff.js.map
