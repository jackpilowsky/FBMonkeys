const UUIDjs = require('uuid-js');
const UtilsJS = require('./utils/Utils.js');
const MutableObject = UtilsJS.MutableObject;

import CityEvent from './CityEvent';

const START_CHECK_SENSITIVITY = 0.01;

export class FrequencyEffect {
  constructor({
    period = 1,
    name,
    namespace
  } = {}) {
    this.id = UUIDjs
      .create()
      .toString();
    this.name = name;
    this.namespace = namespace;
    this.period = period;

    this.cycleStart = 0;
    this.time = 0;

    this.blocked = false;
  }
  canBegin() {
    return true;
  }
  missingTime() {
    return this.cycleStart + this.period - this.time;
  }
  updateTime(deltaSeconds, parents) {
    let updated = [];

    while (deltaSeconds > 0) {
      /* On effect start, let's check if we should get blocked */
      if (Math.abs(this.cycleStart - this.time) < START_CHECK_SENSITIVITY) {
        if (!this.canBegin(parents)) {
          this.blocked = true;
          break;
        } else {
          updated = updated.concat(this.began(parents));
        }
      }
      this.blocked = false;
      const nextStart = this.cycleStart + this.period;
      const canComplete = deltaSeconds >= nextStart - this.time;
      let partialDelta;
      if (canComplete) {
        partialDelta = nextStart - this.time;
        deltaSeconds -= partialDelta;
        this.time += partialDelta;
        this.cycleStart += this.period;
        updated = updated.concat(this.trigger(parents));
      } else {
        this.time += deltaSeconds;
        deltaSeconds = 0;
      }
    }
    return updated;
  }
  getStatus() {
    let progress = (this.time - this.cycleStart) / this.period;
    return "[" + Math.round(progress * 100) + "% Producing]";
  }

  began(parents) {
    return [];
  }

  trigger(parents) {
    throw Error("Must be overriden – It should return an array of CityEvents");
  }

  abort() {
    let event = new CityEvent({type: CityEvent.kTaskAbortedEvent, object: this});
    return event;
  }

  toString() {
    return this.constructor.name + " (" + this.id + ") " + this.getStatus();
  }
  getDescription() {
    return this.toString();
  }
}
