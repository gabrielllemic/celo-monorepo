"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var internal_1 = require("@celo/protocol/lib/backward/internal");
var ContractAST_1 = require("@openzeppelin/upgrades/lib/utils/ContractAST");
var VISIBILITY_PUBLIC = 'public';
var VISIBILITY_EXTERNAL = 'external';
var CONTRACT_TYPE_CONTRACT = 'contract';
var STORAGE_DEFAULT = 'default';
var OUT_VOID_PARAMETER_STRING = 'void';
var ASTCodeCompatibilityReport = /** @class */ (function () {
    function ASTCodeCompatibilityReport(changes) {
        this.changes = changes;
    }
    ASTCodeCompatibilityReport.prototype.push = function () {
        var _a;
        var changes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            changes[_i] = arguments[_i];
        }
        (_a = this.changes).push.apply(_a, __spread(changes));
    };
    ASTCodeCompatibilityReport.prototype.include = function (other) {
        this.push.apply(this, __spread(other.changes));
    };
    return ASTCodeCompatibilityReport;
}());
exports.ASTCodeCompatibilityReport = ASTCodeCompatibilityReport;
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["Patch"] = 0] = "Patch";
    ChangeType[ChangeType["Minor"] = 1] = "Minor";
    ChangeType[ChangeType["Major"] = 2] = "Major";
})(ChangeType = exports.ChangeType || (exports.ChangeType = {}));
;
var DefaultChangeVisitor = /** @class */ (function () {
    function DefaultChangeVisitor() {
        var _this = this;
        this.visitMethodMutability = function (change) { return _this.visitDefault(change); };
        this.visitMethodParameters = function (change) { return _this.visitDefault(change); };
        this.visitMethodReturn = function (change) { return _this.visitDefault(change); };
        this.visitMethodVisibility = function (change) { return _this.visitDefault(change); };
        this.visitMethodAdded = function (change) { return _this.visitDefault(change); };
        this.visitMethodRemoved = function (change) { return _this.visitDefault(change); };
        this.visitContractType = function (change) { return _this.visitDefault(change); };
        this.visitNewContract = function (change) { return _this.visitDefault(change); };
        this.visitDeployedBytecode = function (change) { return _this.visitDefault(change); };
    }
    return DefaultChangeVisitor;
}());
exports.DefaultChangeVisitor = DefaultChangeVisitor;
var CategorizerChangeVisitor = /** @class */ (function (_super) {
    __extends(CategorizerChangeVisitor, _super);
    function CategorizerChangeVisitor() {
        var _this = _super.call(this) || this;
        // By default assume all are major changes
        _this.visitDefault = function (_change) { return ChangeType.Major; };
        _this.visitMethodAdded = function (_change) { return ChangeType.Minor; };
        _this.visitNewContract = function (_change) { return ChangeType.Minor; };
        _this.visitMethodVisibility = function (change) {
            if (change.oldValue == VISIBILITY_PUBLIC && change.newValue == VISIBILITY_EXTERNAL) {
                // Broader visibility, minor change
                return ChangeType.Minor;
            }
            return ChangeType.Major;
        };
        _this.visitDeployedBytecode = function (_change) { return ChangeType.Patch; };
        return _this;
    }
    return CategorizerChangeVisitor;
}(DefaultChangeVisitor));
exports.CategorizerChangeVisitor = CategorizerChangeVisitor;
var EnglishToStringVisitor = /** @class */ (function () {
    function EnglishToStringVisitor() {
    }
    EnglishToStringVisitor.prototype.visitMethodMutability = function (change) {
        return "Mutability of method " + change.contract + "." + change.signature + " changed from '" + change.oldValue + "' to '" + change.newValue + "'";
    };
    EnglishToStringVisitor.prototype.visitMethodParameters = function (change) {
        return "Parameters of method " + change.contract + "." + change.signature + " changed from '" + change.oldValue + "' to '" + change.newValue + "'";
    };
    EnglishToStringVisitor.prototype.visitMethodReturn = function (change) {
        return "Return parameters of method " + change.contract + "." + change.signature + " changed from '" + change.oldValue + "' to '" + change.newValue + "'";
    };
    EnglishToStringVisitor.prototype.visitMethodVisibility = function (change) {
        return "Visibility of method " + change.contract + "." + change.signature + " changed from '" + change.oldValue + "' to '" + change.newValue + "'";
    };
    EnglishToStringVisitor.prototype.visitMethodAdded = function (change) {
        return "Contract '" + change.contract + "' has a new method: '" + change.signature + "'";
    };
    EnglishToStringVisitor.prototype.visitMethodRemoved = function (change) {
        return "Contract '" + change.contract + "' deleted a method: '" + change.signature + "'";
    };
    EnglishToStringVisitor.prototype.visitContractType = function (change) {
        return "Contract '" + change.contract + "' changed its type from '" + change.oldValue + "' to '" + change.newValue + "'";
    };
    EnglishToStringVisitor.prototype.visitNewContract = function (change) {
        return "Contract '" + change.contract + "' was created";
    };
    EnglishToStringVisitor.prototype.visitDeployedBytecode = function (change) {
        return "Contract '" + change.contract + "' has a modified 'deployedBytecode' binary property";
    };
    return EnglishToStringVisitor;
}());
exports.EnglishToStringVisitor = EnglishToStringVisitor;
var ContractChange = /** @class */ (function () {
    function ContractChange(contract) {
        this.contract = contract;
    }
    ContractChange.prototype.getContract = function () {
        return this.contract;
    };
    return ContractChange;
}());
var NewContractChange = /** @class */ (function (_super) {
    __extends(NewContractChange, _super);
    function NewContractChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "NewContract";
        return _this;
    }
    NewContractChange.prototype.accept = function (visitor) {
        return visitor.visitNewContract(this);
    };
    return NewContractChange;
}(ContractChange));
exports.NewContractChange = NewContractChange;
var ContractValueChange = /** @class */ (function (_super) {
    __extends(ContractValueChange, _super);
    function ContractValueChange(contract, oldValue, newValue) {
        var _this = _super.call(this, contract) || this;
        _this.oldValue = oldValue;
        _this.newValue = newValue;
        return _this;
    }
    return ContractValueChange;
}(ContractChange));
var DeployedBytecodeChange = /** @class */ (function (_super) {
    __extends(DeployedBytecodeChange, _super);
    function DeployedBytecodeChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "DeployedBytecode";
        return _this;
    }
    DeployedBytecodeChange.prototype.accept = function (visitor) {
        return visitor.visitDeployedBytecode(this);
    };
    return DeployedBytecodeChange;
}(ContractChange));
exports.DeployedBytecodeChange = DeployedBytecodeChange;
var ContractTypeChange = /** @class */ (function (_super) {
    __extends(ContractTypeChange, _super);
    function ContractTypeChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "ContractType";
        return _this;
    }
    ContractTypeChange.prototype.accept = function (visitor) {
        return visitor.visitContractType(this);
    };
    return ContractTypeChange;
}(ContractValueChange));
exports.ContractTypeChange = ContractTypeChange;
var MethodChange = /** @class */ (function (_super) {
    __extends(MethodChange, _super);
    function MethodChange(contract, signature) {
        var _this = _super.call(this, contract) || this;
        _this.signature = signature;
        return _this;
    }
    MethodChange.prototype.getSignature = function () {
        return this.signature;
    };
    return MethodChange;
}(ContractChange));
var MethodAddedChange = /** @class */ (function (_super) {
    __extends(MethodAddedChange, _super);
    function MethodAddedChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "MethodAdded";
        return _this;
    }
    MethodAddedChange.prototype.accept = function (visitor) {
        return visitor.visitMethodAdded(this);
    };
    return MethodAddedChange;
}(MethodChange));
exports.MethodAddedChange = MethodAddedChange;
var MethodRemovedChange = /** @class */ (function (_super) {
    __extends(MethodRemovedChange, _super);
    function MethodRemovedChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "MethodRemoved";
        return _this;
    }
    MethodRemovedChange.prototype.accept = function (visitor) {
        return visitor.visitMethodRemoved(this);
    };
    return MethodRemovedChange;
}(MethodChange));
exports.MethodRemovedChange = MethodRemovedChange;
var MethodValueChange = /** @class */ (function (_super) {
    __extends(MethodValueChange, _super);
    function MethodValueChange(contract, signature, oldValue, newValue) {
        var _this = _super.call(this, contract, signature) || this;
        _this.oldValue = oldValue;
        _this.newValue = newValue;
        return _this;
    }
    return MethodValueChange;
}(MethodChange));
var MethodVisibilityChange = /** @class */ (function (_super) {
    __extends(MethodVisibilityChange, _super);
    function MethodVisibilityChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "MethodVisibility";
        return _this;
    }
    MethodVisibilityChange.prototype.accept = function (visitor) {
        return visitor.visitMethodVisibility(this);
    };
    return MethodVisibilityChange;
}(MethodValueChange));
exports.MethodVisibilityChange = MethodVisibilityChange;
var MethodMutabilityChange = /** @class */ (function (_super) {
    __extends(MethodMutabilityChange, _super);
    function MethodMutabilityChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "MethodMutability";
        return _this;
    }
    MethodMutabilityChange.prototype.accept = function (visitor) {
        return visitor.visitMethodMutability(this);
    };
    return MethodMutabilityChange;
}(MethodValueChange));
exports.MethodMutabilityChange = MethodMutabilityChange;
var MethodParametersChange = /** @class */ (function (_super) {
    __extends(MethodParametersChange, _super);
    function MethodParametersChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "MethodParameters";
        return _this;
    }
    MethodParametersChange.prototype.accept = function (visitor) {
        return visitor.visitMethodParameters(this);
    };
    return MethodParametersChange;
}(MethodValueChange));
exports.MethodParametersChange = MethodParametersChange;
var MethodReturnChange = /** @class */ (function (_super) {
    __extends(MethodReturnChange, _super);
    function MethodReturnChange() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "MethodReturn";
        return _this;
    }
    MethodReturnChange.prototype.accept = function (visitor) {
        return visitor.visitMethodReturn(this);
    };
    return MethodReturnChange;
}(MethodValueChange));
exports.MethodReturnChange = MethodReturnChange;
exports.createIndexByChangeType = function (changes, categorizer) {
    var byCategory = [];
    for (var ct in ChangeType) {
        byCategory[ct] = [];
    }
    changes.map(function (c) { return byCategory[c.accept(categorizer)].push(c); });
    return byCategory;
};
var getSignature = function (method) {
    // This is used as the ID of a method
    return "" + method.selector;
};
var createMethodIndex = function (methods) {
    var asPairs = methods.map(function (m) {
        var _a;
        return (_a = {}, _a["" + getSignature(m)] = m, _a);
    });
    return Object.assign.apply(Object, __spread([{}], asPairs));
};
var mergeReports = function (reports) {
    var report = new ASTCodeCompatibilityReport([]);
    reports.forEach(function (r) {
        report.include(r);
    });
    return report;
};
var parametersSignature = function (parameters) {
    if (parameters.length === 0) {
        return OUT_VOID_PARAMETER_STRING;
    }
    var singleSignature = function (p) {
        var storage = p.storageLocation === STORAGE_DEFAULT ? '' : p.storageLocation + " ";
        return "" + storage + p.typeDescriptions.typeString;
    };
    return parameters.map(singleSignature).join(', ');
};
var checkMethodCompatibility = function (contract, m1, m2) {
    var report = new ASTCodeCompatibilityReport([]);
    var signature = getSignature(m1);
    // Sanity check
    var signature2 = getSignature(m2);
    if (signature !== signature2) {
        throw new Error("Signatures should be equal: " + signature + " !== " + signature2);
    }
    // Visibility changes
    if (m1.visibility != m2.visibility) {
        report.push(new MethodVisibilityChange(contract, signature, m1.visibility, m2.visibility));
    }
    // Parameters signature (types are already equal, but this will check for storage locations)
    var par1 = parametersSignature(m1.parameters.parameters);
    var par2 = parametersSignature(m2.parameters.parameters);
    if (par1 !== par2) {
        report.push(new MethodParametersChange(contract, signature, par1, par2));
    }
    // Return parameter changes
    var ret1 = parametersSignature(m1.returnParameters.parameters);
    var ret2 = parametersSignature(m2.returnParameters.parameters);
    if (ret1 !== ret2) {
        report.push(new MethodParametersChange(contract, signature, ret1, ret2));
    }
    // State mutability changes
    var state1 = m1.stateMutability;
    var state2 = m2.stateMutability;
    if (state1 !== state2) {
        report.push(new MethodMutabilityChange(contract, signature, state1, state2));
    }
    return report;
};
var getCheckableMethodsFromAST = function (contract, id) {
    var checkableMethods = function (method) { return method.visibility == VISIBILITY_EXTERNAL || method.visibility == VISIBILITY_PUBLIC; };
    try {
        return contract.getMethods().filter(checkableMethods);
    }
    catch (error) {
        throw {
            message: "Error in the @openzeppelin/.../ContractAST.getMethods() for the artifacts in the '" + id + "' folder. \n    Most likely this is due to a botched build, or a build on a non-cleaned folder.",
            error: error
        };
    }
};
var doASTCompatibilityReport = function (contractName, oldAST, newAST) {
    var oldMethods = createMethodIndex(getCheckableMethodsFromAST(oldAST, 'old'));
    var newMethods = createMethodIndex(getCheckableMethodsFromAST(newAST, 'new'));
    var report = new ASTCodeCompatibilityReport([]);
    // Check for modified or missing methods in the new version
    Object.keys(oldMethods).forEach(function (signature) {
        var method = oldMethods[signature];
        if (!newMethods.hasOwnProperty(signature)) {
            // Method deleted, major change
            report.push(new MethodRemovedChange(contractName, signature));
            // Continue
            return;
        }
        var newMethod = newMethods[signature];
        report.include(checkMethodCompatibility(contractName, method, newMethod));
    });
    // Check for added methods in the new version
    Object.keys(newMethods).forEach(function (signature) {
        if (!oldMethods.hasOwnProperty(signature)) {
            // New method, minor change
            report.push(new MethodAddedChange(contractName, signature));
        }
    });
    return report;
};
var generateASTCompatibilityReport = function (oldContract, oldArtifacts, newContract, newArtifacts) {
    // Sanity checks
    if (newContract === null) {
        throw new Error('newContract cannot be null');
    }
    if (oldArtifacts === null) {
        throw new Error('oldArtifacts cannot be null');
    }
    if (newArtifacts === null) {
        throw new Error('newArtifacts cannot be null');
    }
    var contractName = newContract.schema.contractName;
    // Need to manually use ContractAST since its internal use in ZContract
    // does not pass the artifacts parameter to the constructor, therefore
    // forcing a reloading of BuildArtifacts.
    var newAST = new ContractAST_1.default(newContract, newArtifacts);
    var newKind = newAST.getContractNode().contractKind;
    if (oldContract === null) {
        if (newKind == CONTRACT_TYPE_CONTRACT) {
            return new ASTCodeCompatibilityReport([new NewContractChange(contractName)]);
        }
        else {
            // New contract added of a non-contract type (library/interface)
            // therefore no functionality added
            return new ASTCodeCompatibilityReport([]);
        }
    }
    // Name sanity check
    if (oldContract.schema.contractName !== contractName) {
        throw new Error("Contract names should be equal: " + oldContract.schema.contractName + " !== " + contractName);
    }
    var oldAST = new ContractAST_1.default(oldContract, oldArtifacts);
    var kind = oldAST.getContractNode().contractKind;
    if (kind !== newKind) {
        // different contract kind (library/interface/contract)
        return new ASTCodeCompatibilityReport([new ContractTypeChange(contractName, kind, newKind)]);
    }
    var report = doASTCompatibilityReport(contractName, oldAST, newAST);
    // Check deployed byte code change
    if (oldContract.schema.deployedBytecode !== newContract.schema.deployedBytecode) {
        report.push(new DeployedBytecodeChange(contractName));
    }
    return report;
};
exports.reportASTIncompatibilities = function (oldArtifacts, newArtifacts) {
    var reports = newArtifacts.listArtifacts().map(function (newArtifact) {
        var oldArtifact = oldArtifacts.getArtifactByName(newArtifact.contractName);
        var oldZContract = oldArtifact ? internal_1.makeZContract(oldArtifact) : null;
        return generateASTCompatibilityReport(oldZContract, oldArtifacts, internal_1.makeZContract(newArtifact), newArtifacts);
    });
    return mergeReports(reports);
};
//# sourceMappingURL=ast-code.js.map