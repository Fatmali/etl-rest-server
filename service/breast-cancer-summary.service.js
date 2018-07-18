const dao = require('../etl-dao');
const Promise = require("bluebird");
const _ = require('lodash');
import {
    MultiDatasetReport
} from '../app/reporting-framework/multi-dataset.report';
import {
    BaseMysqlReport
} from '../app/reporting-framework/base-mysql.report';
import { 
    PatientlistMysqlReport 
} from '../app/reporting-framework/patientlist-mysql.report';
export class BreastCancerSummaryService {

    getAggregateReport(reportParams) {
        return new Promise(function (resolve, reject) {
            if (reportParams.requestParams.indicators) {
                let indicators = reportParams.requestParams.indicators.split(',');
                let columnWhitelist = indicators.concat(['location_id','location_uuid', 'month', 'reporting_month', 'location', 'encounter_datetime','person_id',
                'age_range','gender',
                'encounter_month','encounter_year'
            ]);
                reportParams.requestParams.columnWhitelist = columnWhitelist;
            }

                let report = new BaseMysqlReport('breastCancerSummaryDataSetAggregate', reportParams.requestParams);

            Promise.join(report.generateReport(),
                (results) => {
                    let result =results.results.results;
                    results.size =result?result.length:0;
                    results.result=result;                    
                    delete results['results'];
                    resolve(results);
                    //TODO Do some post processing
                }).catch((errors) => {
                    reject(errors);
                });
        });
    }
    getPatientListReport(reportParams) {

        let indicators = reportParams.indicators.split(',');
        let locations = reportParams.locations.split(',');
        reportParams.locations = locations;
        reportParams.limit = 300;
        reportParams.startIndex = 0;
        let report = new  PatientlistMysqlReport('breastCancerSummaryDataSetAggregate', reportParams);
        

        return new Promise(function (resolve, reject) {
            //TODO: Do some pre processing
            Promise.join(report.generatePatientListReport(indicators),
                (results) => {
                    resolve(results);
                }).catch((errors) => {
                    console.log('Error', errors);
                    reject(errors);
                });
        });

    }

}