import React from 'react';
import PatientRiskGauge from './PatientRiskGauge';
import PatientCriticalAlert from './PatientCriticalAlert';

const PatientRiskResult = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-12">
        <PatientRiskGauge percentage={84} />
      </div>
      <PatientCriticalAlert />
    </div>
  );
};

export default PatientRiskResult;
