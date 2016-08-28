var assert = require('chai').assert
var Player = require('../lib/_base/Player.js').Player;
var SquareCoordinate = require('../lib/_base/SquareCoordinate.js').SquareCoordinate;

var CityTestUtilities = require("./utils/common.js").CityTestUtilities;
var MutableObject = require("../lib/_base/utils/Utils.js").MutableObject;

var CityJS = require('../lib/city/City.js')
var City = CityJS.City;

var CityResource = require('../lib/city/CityResource.js').CityResource;

var BuildingJS = require('../lib/city/Building.js');
var Building = BuildingJS.Building;
var BuildingConstructionAction = BuildingJS.BuildingConstructionAction
;
var CityPlayerJS = require('../lib/city/CityPlayer.js');
var PlayerEarnResourceEffect = CityPlayerJS.PlayerEarnResourceEffect;

describe('Buildings', () => {
  let resource = CityResource.gold(100);

  it('can grant resources', () => {
    let resources = [resource];
    let time = 10;
    let building = new Building({
      effects:[
        new PlayerEarnResourceEffect({
          resources:resources,
          frequency:time
        })
      ],
    });
    let city = new City({
      defaultBuilding: building
    });
    let player = CityTestUtilities.enabledCityPlayer(city);
    let multiplier = 4;
    let moreResources = CityResource.resourcesWithMultiplier(resources, multiplier);

    assert.isFalse(CityResource.playerCanAfford(player, moreResources));
    player.updateTime(time * (multiplier - 1));
    assert.isFalse(CityResource.playerCanAfford(player, moreResources));

    player.updateTime(time);
    assert.isTrue(CityResource.playerCanAfford(player, moreResources));
  });

  it('have action costs', () => {
    let player = CityTestUtilities.enabledCityPlayer();
    let building = new Building({
      costs: [resource]
    });

    let action = new BuildingConstructionAction({
      building: building,
      location: new SquareCoordinate(1,0)
    });

    assert.isFalse(action.isAffordable(player));
    player.earnResource(resource);
    assert.isTrue(action.isAffordable(player));

    action.executeForPlayer(player);
    assert.strictEqual(player.city.buildings.length, 2);
  });

  it('cannot build in same place', () => {
    let player = CityTestUtilities.enabledCityPlayer();
    let building = new Building({
      costs: [resource]
    });

    let action = new BuildingConstructionAction({
      building: building,
      location: new SquareCoordinate(1,0)
    });

    player.earnResource(resource);
    player.earnResource(resource);

    action.executeForPlayer(player);
    assert.throw(() =>action.executeForPlayer(player));

  });
});
