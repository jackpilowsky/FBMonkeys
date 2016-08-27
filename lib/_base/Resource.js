
export class ResourceError extends Error {
}
export class InsuficientResourcesError extends ResourceError {
}
export class UnavailableActionError extends ResourceError {
}

export class Resource {
    constructor(type, amount) {
        this.type = type;
        this.amount = amount;
    }
    toString() {
        return this.type + " x " + this.amount.toFixed(1);
    }
    resourceWithMultiplier(resources) {
        let m = this.amount * resources;
        return new Resource(this.type, m);
    }
    static resourcesWithMultiplier(resources, multiplier) {
        var mResources = [];
        resources.forEach(function(resource) {
            mResources.push(resource.resourceWithMultiplier(multiplier));
        })
        return Resource.aggregateSameTypeResources(mResources);
    }
    static aggregateSameTypeResources(array) {
        var aggregatedResources = {};
        array.forEach(function(cost) {
            if (!aggregatedResources[cost.type]) {
                aggregatedResources[cost.type] = 0;
            }
            aggregatedResources[cost.type] += cost.amount;
        });
        let aggregatedArray = [];
        for (let type in aggregatedResources) {
            aggregatedArray.push(new Resource(type, aggregatedResources[type]));
        }
        return aggregatedArray;
    }
    static playerCanAfford(player, costs) {
        var canAfford = true;
        Resource.aggregateSameTypeResources(costs).forEach(function(cost) {
            var r = player.getResourceAmountForType(cost.type);
            if (r < cost.amount) {
                canAfford = false;
            }
        });
        return canAfford;
    }
}

export class ResourceConsumingAction {
    constructor(displayNameFunction, availabilityFunction, costCalculationFunction, actionFunction) {
        this.displayNameFunction = displayNameFunction;
        this.availabilityFunction = availabilityFunction;
        this.costCalculationFunction = costCalculationFunction;
        this.actionFunction = actionFunction;
    }
    code() {
        return "unnamed_action";
    }
    displayName() {
        return this.displayNameFunction();
    }
    isAvailable(player) {
        return this.availabilityFunction(player);
    }
    isAffordable(player) {
        if (player) {
            var costs = Resource.aggregateSameTypeResources(this.costs());
            return Resource.playerCanAfford(player, costs);
        }
        return false;
    }
    costs() {
        return this.costCalculationFunction();
    }
    executeForPlayer(player) {
        if (!this.isAvailable(player)) {
            throw new UnavailableActionError();
        }
        if (!this.isAffordable(player)) {
            throw new InsuficientResourcesError();
        }
        var costs = Resource.aggregateSameTypeResources(this.costs());
        costs.forEach(function(cost) {
            player.spendResource(cost);
        });
        this.actionFunction(player);
        if (player.resourceConsumingActionExecuted) {
            player.resourceConsumingActionExecuted(this, costs);
        }
    }
}