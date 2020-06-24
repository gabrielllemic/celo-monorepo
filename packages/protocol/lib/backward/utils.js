"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ast_code_1 = require("@celo/protocol/lib/backward/ast-code");
var ast_layout_1 = require("@celo/protocol/lib/backward/ast-layout");
var upgrades_1 = require("@openzeppelin/upgrades");
var fs_extra_1 = require("fs-extra");
var V_STORAGE = 's';
var V_MAJOR = 'x';
var V_MINOR = 'y';
var V_PATCH = 'z';
var ASTBackwardReport = /** @class */ (function () {
    function ASTBackwardReport() {
    }
    return ASTBackwardReport;
}());
exports.ASTBackwardReport = ASTBackwardReport;
exports.isValidVersion = function (version) {
    var v = version.split(".");
    if (v.length != 4) {
        return false;
    }
    return !isNaN(Number(v[0])) && !isNaN(Number(v[1])) && !isNaN(Number(v[2])) && !isNaN(Number(v[3]));
};
var applyDelta = function (n, d, c) {
    if (d === "0") {
        return 0;
    }
    if (d === (c + "+1")) {
        return (n + 1);
    }
    if (d === (c)) {
        return n;
    }
    throw new Error("Invalid delta singular format: " + d + " for character " + c);
};
exports.versionAddDelta = function (version, delta) {
    if (!exports.isValidVersion(version)) {
        throw new Error("Invalid version format: " + version);
    }
    var v = version.split(".");
    var storage = Number(v[0]);
    var major = Number(v[1]);
    var minor = Number(v[2]);
    var patch = Number(v[3]);
    var d = delta.split(".");
    return applyDelta(storage, d[0], V_STORAGE)
        + "." + applyDelta(major, d[1], V_MAJOR)
        + "." + applyDelta(minor, d[2], V_MINOR)
        + "." + applyDelta(patch, d[3], V_PATCH);
};
var ensureValidArtifacts = function (artifactsPaths) {
    artifactsPaths.forEach(function (path) {
        var artifact = fs_extra_1.readJsonSync(path);
        if (artifact.ast == undefined) {
            console.error("ERROR: invalid artifact file found: '" + path + "'");
            process.exit(10001);
        }
    });
};
exports.instantiateArtifacts = function (buildDirectory) {
    // Check if all jsons in the buildDirectory are valid artifacts,
    // otherwise getBuildArtifacts fail with the enigmatic
    // "Cannot read property 'absolutePath' of undefined"
    ensureValidArtifacts(upgrades_1.Contracts.listBuildArtifacts(buildDirectory));
    try {
        return upgrades_1.getBuildArtifacts(buildDirectory);
    }
    catch (error) {
        console.error("ERROR: could not create BuildArtifacts on directory '" + buildDirectory);
        process.exit(10002);
    }
};
var createSemanticVersionDelta = function (report) {
    if (report.storage.length > 0) {
        return V_STORAGE + "+1.0.0.0";
    }
    if (report.major.length > 0) {
        return V_STORAGE + "." + V_MAJOR + "+1.0.0";
    }
    if (report.minor.length > 0) {
        return V_STORAGE + "." + V_MAJOR + "." + V_MINOR + "+1.0";
    }
    if (report.minor.length > 0) {
        return V_STORAGE + "." + V_MAJOR + "." + V_MINOR + "." + V_PATCH + "+1";
    }
    return V_STORAGE + "." + V_MAJOR + "." + V_MINOR + "." + V_PATCH;
};
exports.createReport = function (oldArtifactsFolder, newArtifactsFolder, logFunction) {
    logFunction("Instantiating old artifacts...");
    var artifacts1 = exports.instantiateArtifacts(oldArtifactsFolder);
    logFunction("Done\n");
    logFunction("Instantiating new artifacts...");
    var artifacts2 = exports.instantiateArtifacts(newArtifactsFolder);
    logFunction("Done\n");
    var report = new ASTBackwardReport();
    // Run reports
    logFunction("Running storage report...");
    report.storageReports = ast_layout_1.reportLayoutIncompatibilities(artifacts1, artifacts2);
    logFunction("Done\n");
    logFunction("Running code report...");
    report.codeReport = ast_code_1.reportASTIncompatibilities(artifacts1, artifacts2);
    logFunction("Done\n");
    logFunction("Generating backward report...");
    report.storage = report.storageReports.filter(function (r) { return !r.compatible; });
    var byChangeType = ast_code_1.createIndexByChangeType(report.codeReport.changes, new ast_code_1.CategorizerChangeVisitor());
    report.major = byChangeType[ast_code_1.ChangeType.Major];
    report.minor = byChangeType[ast_code_1.ChangeType.Minor];
    report.patch = byChangeType[ast_code_1.ChangeType.Patch];
    report.versionDelta = createSemanticVersionDelta(report);
    logFunction("Done\n");
    return report;
};
//# sourceMappingURL=utils.js.map