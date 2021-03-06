
const CitySerializer = require("../city/CitySerializer.js").default;
const {CityPlayer} = require('../city/CityPlayer.js');
const GameModule = require('../module/GameModule.js').default;
const EventEmitter = require('events');

export default class GameController extends EventEmitter {
  constructor() {
    super();
    this.module = new GameModule();
    this.startNewGame();
  }

  _emit(event) {
    this.emit(event.type, event.object, event.data);
  }

  startNewGame() {
    this.loadPlayer(new CityPlayer());
  }

  loadPlayer(player) {
    if (!this.player) {
      this.player = new CityPlayer();
    }
    Object.assign(this.player,  player);
    this.player.initialCapacity = this.module.getPlayerInitialCapacity();
    this.player.characterFactories = this.module.getCharacterFactories();
    this.player.seasonPeriod = this.player.city.seasonPeriod = this.module.getSeasonPeriod();
    this.player.seasonAffectedResource = this.player.city.seasonAffectedResource =this.module.getSeasonAffectedResource();

  }

  getAllMyBuilding() {
    return JSON.parse(CitySerializer.serialize(this.player.city.buildings));
  }

  getBuilding(id) {
    return JSON.parse(CitySerializer.serialize(this.player.city.buildings[id]));
  }

  tick(delta) {
    let _this = this;
    let events = this.player.updateTime(delta);
    events.forEach((event) => _this._emit(event));
    return events;
  }

  planBuilding(namespace) {
    let b = this.module.allBuildings()[namespace];
    if (!b) {
      throw new UnavailableActionError();
    }
    let event = this.player.city.planBuilding({
      building: b
    });
    this._emit(event);
    return event;
  }

  collectFromBuilding(id) {
    let b = this.player.city.buildings[id];
    if (!b) {
      throw new UnavailableActionError();
    }
    let event = b.collectResources(this.player);
    this._emit(event);
    return event;
  }

  installCompletedBuilding(namespace) {
    let event = this.planBuilding(namespace);
    let events = [event];
    let building = this.player.city.buildings[event.object.id];
    if (!building) {
      throw new UnavailableActionError();
    }
    events.push(building.updateTime(building.setupTime, {}));
    return events;
  }

  scheduleResearch(namespace) {
    let research = this.module.allResearch()[namespace];
    if (!research) {
      throw new UnavailableActionError();
    }
    let event = this.player.scheduleResearch(research);
    return [event];
  }

  setCharacterTasks(id, taskNamespaces) {
    let character = this.player.city.characters[id];
    if (!character) {
      throw new UnavailableActionError();
    }
    let tasks = taskNamespaces.map(n => this.module.availableTasks()[n]);
    let event = character.setTasks(tasks);
    return [event];
  }
}

GameController.instance = new GameController();
