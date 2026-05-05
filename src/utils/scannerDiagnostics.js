/**
 * Scanner Diagnostics Layer
 */
const diagnostics = {
  successCount: 0,
  failCount: 0,
  scanTimes: [],
  formats: new Set(),
  startTime: 0,
};

export const startScanTimer = () => {
  diagnostics.startTime = Date.now();
};

export const recordScanSuccess = (format) => {
  const duration = Date.now() - diagnostics.startTime;
  diagnostics.successCount++;
  diagnostics.scanTimes.push(duration);
  if (format) diagnostics.formats.add(format);
};

export const recordScanFail = () => {
  diagnostics.failCount++;
};

export const getDiagnosticsReport = () => {
  const avgTime = diagnostics.scanTimes.length 
    ? Math.round(diagnostics.scanTimes.reduce((a, b) => a + b, 0) / diagnostics.scanTimes.length) 
    : 0;

  return {
    successRate: diagnostics.successCount + diagnostics.failCount > 0 
      ? Math.round((diagnostics.successCount / (diagnostics.successCount + diagnostics.failCount)) * 100) 
      : 0,
    avgDetectionTime: `${avgTime}ms`,
    formats: Array.from(diagnostics.formats).join(', ') || 'None',
    totalScans: diagnostics.successCount,
    failedAttempts: diagnostics.failCount
  };
};
