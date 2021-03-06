import {assert} from 'chai'
import {CityPlayer} from '../lib/city/CityPlayer';
import {CityResource, ResourceConsumingAction, InsuficientResourcesError, UnavailableActionError} from '../lib/city/CityResource';

const resourceType = "kTestResourceType";
const resourceType2 = "kTestResourceType2";
const createResource = (amount) => new CityResource(resourceType, amount);
const createResource2 = (amount) => new CityResource(resourceType2, amount);

let amount = 100;
let playerCapacity = {
  initialCapacity: {
    [resourceType]: amount * 10,
    [resourceType2]: amount * 10
  }
};

describe('Resources', () => {

  let multiplier = 10;

  it('can be multiplied', () => {
    let resource = createResource(amount);
    let moreResources = resource.resourceWithMultiplier(multiplier);
    assert.strictEqual(moreResources.amount, amount * multiplier);
  });

  it('can be earned', () => {
    let player = new CityPlayer(playerCapacity);
    let resource = createResource(amount);
    assert.strictEqual(player.getResourceAmountForType(resourceType), 0);

    player.earnResources([resource]);
    assert.strictEqual(player.getResourceAmountForType(resourceType), amount);

    let moreResources = resource.resourceWithMultiplier(multiplier);
    assert.strictEqual(moreResources.amount, amount * multiplier);
  });

  it('can be covered', () => {
    let little = 5;
    let more = 10;
    let aLot = 20;

    let haveResources = [createResource(little), createResource2(aLot)];
    let needResources = [createResource(aLot), createResource2(more)];

    // Have 15 (5 + 10) of 30 (20 + 10) needed
    assert.equal(0.5, CityResource.resourcesCoverCosts(haveResources, needResources));

    // Have 30 (20 + 10) of 30 (20 + 10) needed
    let nowHaveMore = [createResource(aLot), createResource2(aLot)];
    assert.equal(1, CityResource.resourcesCoverCosts(nowHaveMore, needResources));
  });

  it('cannot spend if dont have', () => {
    let player = new CityPlayer(playerCapacity);
    let resource = createResource(amount);
    let spend = function() { player.spendResources([resource]); };
    assert.throw(spend);
    // assert.throw(spend, InsuficientResourcesError);

    player.earnResources([resource.resourceWithMultiplier(.5)]);
    assert.throw(spend);
    // assert.throw(spend, InsuficientResourcesError);

    player.earnResources([resource.resourceWithMultiplier(.5)]);
    spend();
  });

});

describe('Resource Consuming Actions', () => {
  let kActionName = "kActionName";
  let amount = 100;
  let resources = [createResource(amount)];

  it('can become available', () => {
    let player = new CityPlayer(playerCapacity);
    player.earnResources(resources);

    let available = false;
    let actionCalled = false;

    let action = new ResourceConsumingAction(() => kActionName, () => available, () => resources, () => actionCalled = true);

    assert.equal(kActionName, action.displayName());

    assert.isFalse(action.isAvailable(player));
    // assert.throw(() => action.executeForPlayer(player), UnavailableActionError);
    assert.throw(() => action.executeForPlayer(player));
    assert.isFalse(actionCalled);

    available = true;
    assert.isTrue(action.isAvailable(player));
    action.executeForPlayer(player);
    assert.isTrue(actionCalled);
  });

  it('consume resources', () => {
    let player = new CityPlayer(playerCapacity);
    let actionCalled = false;
    let resources = [createResource(amount)];

    let kActionName = "kActionName";
    let action = new ResourceConsumingAction(() => kActionName, () => true, () => resources, () => actionCalled = true);

    assert.equal(kActionName, action.displayName());

    assert.isTrue(action.isAvailable(player));
    assert.isFalse(action.isAffordable(player));

    // assert.throw(() => action.executeForPlayer(player), InsuficientResourcesError);
    assert.throw(() => action.executeForPlayer(player));
    assert.isFalse(actionCalled);

    player.earnResources(CityResource.resourcesWithMultiplier(resources, 2));
    assert.isTrue(action.isAffordable(player));

    action.executeForPlayer(player);
    assert.isTrue(actionCalled);
    assert.isTrue(action.isAffordable(player), "Player can affort twice");

    action.executeForPlayer(player);
    assert.isFalse(action.isAffordable(player), "Player cannot afford it thrice");
  });
});
