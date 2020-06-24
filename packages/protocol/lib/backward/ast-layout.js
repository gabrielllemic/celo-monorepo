"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var upgrades_1 = require("@openzeppelin/upgrades");
var Web3 = require('web3');
var web3 = new Web3(null);
// getStorageLayout needs an oz-sdk Contract class instance. This class is a
// subclass of Contract from web3-eth-contract, with an added .schema member and
// several methods.
//
// Couldn't find an easy way of getting one just from contract artifacts. But
// for getStorageLayout we really only need .schema.ast and .schema.contractName.
var addSchemaForLayoutChecking = function (web3Contract, artifact) {
    // @ts-ignore
    var contract = web3Contract;
    // @ts-ignore
    contract.schema = {};
    contract.schema.ast = artifact.ast;
    contract.schema.contractName = artifact.contractName;
    return contract;
};
var makeZContract = function (artifact) {
    var contract = new web3.eth.Contract(artifact.abi);
    return addSchemaForLayoutChecking(contract, artifact);
};
exports.getLayout = function (artifact, artifacts) {
    var contract = makeZContract(artifact);
    return upgrades_1.getStorageLayout(contract, artifacts);
};
var selectIncompatibleOperations = function (diff) {
    return diff.filter(function (operation) { return operation.action !== 'append'; });
};
var generateErrorMessage = function (operation) {
    var message;
    var updated = operation.updated;
    var original = operation.original;
    switch (operation.action) {
        case 'typechange':
            message = "variable " + updated.label + " had type " + original.type + ", now has type " + updated.type;
            break;
        case 'insert':
            message = "variable " + updated.label + " was inserted";
            break;
        case 'pop':
            message = "variable " + original.label + " was removed";
            break;
        case 'delete':
            message = "variable " + original.label + " was removed";
            break;
        case 'rename':
            message = "variable " + updated.label + " was renamed from " + original.label;
            break;
        default:
            message = "unknown operation " + operation.action;
    }
    return message;
};
var generateLayoutCompatibilityReport = function (oldLayout, newLayout) {
    var diff = upgrades_1.compareStorageLayouts(oldLayout, newLayout);
    var incompatibilities = selectIncompatibleOperations(diff);
    if (incompatibilities.length === 0) {
        return {
            compatible: true,
            errors: []
        };
    }
    else {
        return {
            compatible: false,
            errors: incompatibilities.map(generateErrorMessage)
        };
    }
};
var compareStructDefinitions = function (oldType, newType) {
    if (oldType.kind !== 'struct') {
        return {
            same: false,
            errors: [newType.label + " wasn't a struct type, now is"]
        };
    }
    if (oldType.members.length !== newType.members.length) {
        return {
            same: false,
            errors: ["struct " + newType.label + " has changed members"]
        };
    }
    var memberErrors = newType.members.map(function (newMember, i) {
        var oldMember = oldType.members[i];
        if (oldMember.label !== newMember.label) {
            return "struct " + newType.label + " has new member " + newMember.label;
        }
        if (oldMember.type !== newMember.type) {
            return "struct " + newType.label + "'s member " + newMember.label + " changed type from " + oldMember.type + " to " + newMember.type;
        }
        return '';
    }).filter(function (error) { return error !== ''; });
    return {
        same: memberErrors.length === 0,
        errors: memberErrors
    };
};
var generateStructsCompatibilityReport = function (oldLayout, newLayout) {
    var compatible = true;
    var errors = [];
    Object.keys(newLayout.types).forEach(function (typeName) {
        var newType = newLayout.types[typeName];
        var oldType = oldLayout.types[typeName];
        if (newType.kind === 'struct' && oldType !== undefined) {
            var structReport = compareStructDefinitions(oldType, newType);
            if (!structReport.same) {
                compatible = false;
                errors = errors.concat(structReport.errors);
            }
        }
    });
    return {
        compatible: compatible,
        errors: errors
    };
};
exports.generateCompatibilityReport = function (oldArtifact, oldArtifacts, newArtifact, newArtifacts) {
    var oldLayout = exports.getLayout(oldArtifact, oldArtifacts);
    var newLayout = exports.getLayout(newArtifact, newArtifacts);
    var layoutReport = generateLayoutCompatibilityReport(oldLayout, newLayout);
    var structsReport = generateStructsCompatibilityReport(oldLayout, newLayout);
    return {
        contract: newArtifact.contractName,
        compatible: layoutReport.compatible && structsReport.compatible,
        errors: layoutReport.errors.concat(structsReport.errors)
    };
};
exports.reportLayoutIncompatibilities = function (oldArtifacts, newArtifacts) {
    return newArtifacts.listArtifacts().map(function (newArtifact) {
        var oldArtifact = oldArtifacts.getArtifactByName(newArtifact.contractName);
        if (oldArtifact !== undefined) {
            return exports.generateCompatibilityReport(oldArtifact, oldArtifacts, newArtifact, newArtifacts);
        }
    });
};
//# sourceMappingURL=ast-layout.js.map