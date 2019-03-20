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
        ignoreclasscoverage: flags.boolean({ char: 'c', required: false, default: false, description: messages.getMessage('ignoreClassCoverageFailuresFlagDescription')})
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

        // this.ux.log(coverages);

        if ( ! this.flags.ignoreclasscoverage ) {
            const converageRequirementForApexClass = _.get(projectJson['contents'], 'plugins.rstk.coverageRequirementForClasses', 81);

            const coverageResultInformation = testResultInformation.coverage;
            // this.ux.logJson(coverageResultInformation);

            const coverageSubsectionResultInformation = coverageResultInformation.coverage;
            // this.ux.logJson(coverageSubsectionResultInformation);

            // const orgSuccessResult = {};
            // orgSuccessResult['success'] = false;
            // const classesResult = {};

            // classesResult['classes'] = orgSuccessResult;
            // checkResult['coverage'] = classesResult;

            // The following output only works if the testcoveragefile is test-result-codecoverage.json file
            // this reviews the individual coverage for each Apex class file
            _.forEach(coverageSubsectionResultInformation, coverage => {
                // this.ux.log('coverage[coveredPercent] == ' + coverage['coveredPercent']);
                if (coverage['coveredPercent'] < converageRequirementForApexClass) {
                    // TODO: Need to refactor this to list all errors once the process is complete
                    // throw new core.SfdxError(`The coverage for ${coverage['name']} is less than ${converageRequirementForApexClass}`);
                    // this.ux.error(`The coverage for ${coverage['name']} is less than ${converageRequirementForApexClass}`);
                    this.ux.error(messages.getMessage('errorClassCoverageBelowMinimum', [coverage['name'], coverage['coveredPercent'], converageRequirementForApexClass]));
                }
            });
        }

        if ( ! this.flags.ignoreorgcoverage ) {
            const converageRequirementForOrg = _.get(projectJson['contents'], 'plugins.rstk.coverageRequirementForOrg', 50);
            const summaryResultInformation = testResultInformation.summary;
            const orgWideCoverage = summaryResultInformation.orgWideCoverage.replace('%', '');

            // this.ux.log('orgWideCoverage == ' + orgWideCoverage);
            if ( orgWideCoverage < converageRequirementForOrg ) {
                // TODO: Need to refactor this to list all errors once the process is complete
                // throw new core.SfdxError(messages.getMessage('errorOrgWideCoverageBelowMinimum', [orgWideCoverage, converageRequirementForOrg]));
                this.ux.error(messages.getMessage('errorOrgWideCoverageBelowMinimum', [orgWideCoverage, converageRequirementForOrg]));

                const orgSuccessResult = {};
                orgSuccessResult['success'] = false;
                orgSuccessResult['coveredPercent'] = orgWideCoverage;
                orgSuccessResult['converageRequirementForOrg'] = converageRequirementForOrg;
                const orgResult = {};
                orgResult['org'] = orgSuccessResult;
                checkResult['coverage'] = orgResult;
            }
        }

        // TODO: Need a section that explains what the adjustments are needed

        this.ux.log('Success');

        // Return an object to be displayed with --json
        return checkResult;
    }
}
