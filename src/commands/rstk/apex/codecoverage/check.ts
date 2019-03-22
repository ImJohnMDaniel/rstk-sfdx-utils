import { core, flags, SfdxCommand } from '@salesforce/command';
import fs = require('fs-extra');
import * as _ from 'lodash';
import { join } from 'path';

core.Messages.importMessagesDirectory(join(__dirname));
const messages = core.Messages.loadMessages('rstk-sfdx-utils', 'rstk-apex-codecoverage-check');

export default class Check extends SfdxCommand {

    public static description = messages.getMessage('commandDescription');

    public static examples = [messages.getMessage('examplesDescription')];

    protected static flagsConfig = {
        testcoveragefile: flags.string({ char: 'f', required: true, description: messages.getMessage('testCoverageFileFlagDescription') }),
        ignoreorgcoverage: flags.boolean({ char: 'o', required: false, default: false, description: messages.getMessage('ignoreOrgCoverageFailureFlagDescription')}),
        ignoreclasscoverage: flags.boolean({ char: 'c', required: false, default: false, description: messages.getMessage('ignoreClassCoverageFailuresFlagDescription')}),
        throwerroroninsufficientorgcoverage: flags.boolean({ char: 'x', required: false, default: false, description: messages.getMessage('throwErrorOnInsufficientOrgCoverageFlagDescription')}),
        throwerroroninsufficientclasscoverage: flags.boolean({ char: 'y', required: false, default: false, description: messages.getMessage('throwErrorOnInsufficientClassCoverageFlagDescription')})
    };

    // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
    protected static requiresProject = true;

    public async run(): Promise<any> { // tslint:disable-line:no-any

        const checkResult = {};

        const projectJson = await this.project.retrieveSfdxProjectJson();
        // this.ux.logJson(projectJson);
        // this.ux.logJson(projectJson['contents']); // this approach works!!!
        // const blue = projectJson.get('contents');
        // this.ux.logJson(blue);

        // const converageRequirementForApexClass = _.get(projectJson.get('plugins'), 'rstk.coverageRequirement') || 70;
        // const converageRequirementForApexClass = _.get(projectJson.get('contents'), 'plugins.rstk.coverageRequirementForClasses', 81);

        // this.ux.logJson(converageRequirementForApexClass);
        // When reading a file with core library, it is an async operation and thus you need the "await" command added.
        // this.ux.log(this.flags.testcoveragefile);
        checkResult['testCoverageFileReviewed'] = this.flags.testcoveragefile;
        // JSON.parse(fs.readFileSync(projectFile.getPath(), 'UTF-8'));
        // const coverages = await core.fs.readJsonMap(this.flags.testcoveragefile);
        const testResultInformation = JSON.parse(fs.readFileSync(this.flags.testcoveragefile, 'UTF-8'));

        let allClassesHaveSufficientCodeCoverage = true;
        let orgHasSufficientCodeCoverage = true;
        const actionMessages = [];

        // this.ux.log(coverages);

        if ( ! this.flags.ignoreorgcoverage ) {
            const converageRequirementForOrg = _.get(projectJson['contents'], 'plugins.rstk.coverageRequirement.org', 50);
            const summaryResultInformation = testResultInformation.summary;
            const orgWideCoverage = summaryResultInformation.orgWideCoverage.replace('%', '');

            const orgSuccessResult = {};

            orgSuccessResult['coveredPercent'] = orgWideCoverage;
            orgSuccessResult['converageRequirementForOrg'] = converageRequirementForOrg;

            // this.ux.log('orgWideCoverage == ' + orgWideCoverage);
            if ( orgWideCoverage < converageRequirementForOrg ) {
                // TODO: Need to refactor this to list all errors once the process is complete
                // throw new core.SfdxError(messages.getMessage('errorOrgWideCoverageBelowMinimum', [orgWideCoverage, converageRequirementForOrg]));
                actionMessages.push(messages.getMessage('errorOrgWideCoverageBelowMinimum', [orgWideCoverage, converageRequirementForOrg]));
                this.ux.error(messages.getMessage('errorOrgWideCoverageBelowMinimum', [orgWideCoverage, converageRequirementForOrg]));

                orgSuccessResult['success'] = false;
                orgHasSufficientCodeCoverage = false;
            } else {
                orgSuccessResult['success'] = true;
            }
            if (!checkResult['coverage']) {
                checkResult['coverage'] = {};
            }
            checkResult['coverage'].org = orgSuccessResult;
        }

        if ( ! this.flags.ignoreclasscoverage ) {
            const converageRequirementForApexClass = _.get(projectJson['contents'], 'plugins.rstk.coverageRequirement.classes', 75);

            const coverageResultInformation = testResultInformation.coverage;
            // this.ux.logJson(coverageResultInformation);

            const coverageSubsectionResultInformation = coverageResultInformation.coverage;
            // this.ux.logJson(coverageSubsectionResultInformation);

            
            // orgSuccessResult['success'] = false;
            const classDetailCoverages = [];

            // classesResult['classes'] = orgSuccessResult;
            // checkResult['coverage'] = classesResult;

            // The following output only works if the testcoveragefile is test-result-codecoverage.json file
            // this reviews the individual coverage for each Apex class file
            _.forEach(coverageSubsectionResultInformation, coverage => {
                const classSuccessResult = {};
                // this.ux.log('coverage[coveredPercent] == ' + coverage['coveredPercent']);
                classSuccessResult['name'] = coverage['name'];
                classSuccessResult['coveredPercent'] = coverage['coveredPercent'];
                if (coverage['coveredPercent'] < converageRequirementForApexClass) {
                    // TODO: Need to refactor this to list all errors once the process is complete
                    // throw new core.SfdxError(`The coverage for ${coverage['name']} is less than ${converageRequirementForApexClass}`);
                    // this.ux.error(`The coverage for ${coverage['name']} is less than ${converageRequirementForApexClass}`);
                    actionMessages.push(messages.getMessage('errorClassCoverageBelowMinimum', [coverage['name'], coverage['coveredPercent'], converageRequirementForApexClass]));
                    this.ux.error(messages.getMessage('errorClassCoverageBelowMinimum', [coverage['name'], coverage['coveredPercent'], converageRequirementForApexClass]));
                    classSuccessResult['success'] = false;
                    allClassesHaveSufficientCodeCoverage = false;
                } else {
                    classSuccessResult['success'] = true;
                }
                classDetailCoverages.push(classSuccessResult);
            });
            const classesResult = {};
            classesResult['converageRequirementForClasses'] = converageRequirementForApexClass;
            classesResult['success'] = allClassesHaveSufficientCodeCoverage;
            classesResult['classDetailCoverage'] = classDetailCoverages;
            if (!checkResult['coverage']) {
                checkResult['coverage'] = {};
            }
            checkResult['coverage'].classes = classesResult;
        }

        // throw error if called for
        if ( (!this.flags.ignoreorgcoverage && this.flags.throwerroroninsufficientorgcoverage && !orgHasSufficientCodeCoverage)
            || (!this.flags.ignoreclasscoverage && this.flags.throwerroroninsufficientclasscoverage && !allClassesHaveSufficientCodeCoverage)
        ) {
           throw new core.SfdxError('Code Coverage Insufficient', 'CODE COVERAGE INSUFFICIENT', actionMessages, 1, null); 
        }

        // Return an object to be displayed with --json
        return checkResult;
    }
}
