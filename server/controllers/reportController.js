import Report from '../models/Report.js';

// Simple helper function to determine High/Low/Normal flag
const getResultFlag = (result, normalRange) => {
  const numericResult = parseFloat(result);
  if (isNaN(numericResult)) return ''; // Cannot determine flag for non-numeric results

  // Try to parse range like "10-20" or "10 - 20"
  const rangeMatch = normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (numericResult < min) return 'Low';
    if (numericResult > max) return 'High';
    return 'Normal';
  }
  
  // Try to parse range like "< 5" or "> 10"
  const singleValueMatch = normalRange.match(/([<>]=?)\s*([\d.]+)/);
  if (singleValueMatch) {
    const operator = singleValueMatch[1];
    const value = parseFloat(singleValueMatch[2]);
    if (operator === '<' || operator === '<=') {
      if (numericResult >= value) return 'High';
    }
    if (operator === '>' || operator === '>=') {
      if (numericResult <= value) return 'Low';
    }
    return 'Normal';
  }

  // Cannot determine from the given range format
  return ''; 
};

export const reportController = {
  // Get a report by its associated Bill ID
  async getReportByBillId(req, res) {
    try {
      const { billId } = req.params;
      const report = await Report.findOne({ bill: billId }).populate('results.test', 'name units normalRange');
      if (!report) {
        return res.status(404).json({ message: 'Report not found for this bill' });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching report', error: error.message });
    }
  },

  // Update a report (specifically, the test results and report date)
  async updateReport(req, res) {
    try {
      const { reportId } = req.params;
      const { results, reportDate } = req.body; // Expects an array of result objects and optional reportDate

      const report = await Report.findById(reportId).populate('results.test', 'name units normalRange');
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      // Update report date if provided
      if (reportDate !== undefined) {
        report.reportDate = reportDate ? new Date(reportDate) : null;
      }

      // Update results and auto-calculate flags if results are provided
      if (results && results.length > 0) {
        for (const updatedResult of results) {
          const resultToUpdate = report.results.find(r => r.test._id.toString() === updatedResult.test);
          if (resultToUpdate) {
            resultToUpdate.result = updatedResult.result || '';
            // Use provided flag or calculate if not provided
            if (updatedResult.flag) {
              resultToUpdate.flag = updatedResult.flag;
            } else {
              resultToUpdate.flag = getResultFlag(updatedResult.result, resultToUpdate.test.normalRange);
            }
          }
        }
      }

      await report.save();
      
      // Fetch the updated report with fresh population
      const updatedReport = await Report.findById(reportId).populate('results.test', 'name units normalRange');

      res.json({ message: 'Report updated successfully', report: updatedReport });
    } catch (error) {
      res.status(500).json({ message: 'Error updating report', error: error.message });
    }
  },

  // Set report date when report is first generated or printed
  async setReportDate(req, res) {
    try {
      const { billId } = req.params;
      
      const report = await Report.findOne({ bill: billId });
      if (!report) {
        return res.status(404).json({ message: 'Report not found for this bill' });
      }

      // Only set report date if it's not already set
      if (!report.reportDate) {
        report.reportDate = new Date();
        await report.save();
      }

      res.json({ message: 'Report date set successfully', reportDate: report.reportDate });
    } catch (error) {
      res.status(500).json({ message: 'Error setting report date', error: error.message });
    }
  },
}; 