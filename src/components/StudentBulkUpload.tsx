import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BulkStudent {
  roll_no: string;
  name: string;
  year: number;
}

export default function StudentBulkUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<BulkStudent[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setParsedData([]);
    setShowPreview(false);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(sheet);

        if (json.length === 0) {
          setError('File is empty');
          return;
        }

        const students: BulkStudent[] = json
          .map((row) => ({
            roll_no: String(row['RollNo'] || row['roll_no'] || '').trim(),
            name: String(row['Name'] || row['name'] || '').trim(),
            year: parseInt(row['Year'] || row['year'] || '1'),
          }))
          .filter((s) => s.roll_no && s.name && s.year >= 1 && s.year <= 4);

        if (students.length === 0) {
          setError(
            'No valid students found. Ensure columns: RollNo, Name, Year'
          );
          return;
        }

        setParsedData(students);
        setShowPreview(true);
        setSuccess(`Found ${students.length} valid students`);
      } catch (err: any) {
        setError(err.message || 'Failed to parse file');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setError('No students to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const { error } = await supabase.from('students').insert(
        parsedData.map((s) => ({
          roll_no: s.roll_no,
          name: s.name,
          year: s.year,
        }))
      );

      if (error) throw error;

      setSuccess(
        `Successfully uploaded ${parsedData.length} students!`
      );
      setParsedData([]);
      setFileName('');
      setShowPreview(false);
    } catch (err: any) {
      setError(err.message || 'Failed to upload students');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bulk Upload Students</h2>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">File Format</h3>
          <p className="text-sm text-blue-800 mb-3">
            Upload a CSV or Excel file with the following columns:
          </p>
          <div className="bg-white rounded p-3 text-sm font-mono text-gray-700">
            <div>RollNo | Name | Year</div>
            <div className="text-gray-500 mt-2">Example:</div>
            <div>21A91A01A1 | John Doe | 1</div>
            <div>21A91A01A2 | Jane Smith | 2</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {success && !uploading && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>{success}</div>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Click to upload or drag file</p>
            <p className="text-sm text-gray-600">CSV or Excel format</p>
            {fileName && (
              <p className="text-sm text-blue-600 mt-2">Selected: {fileName}</p>
            )}
          </label>
        </div>

        {showPreview && parsedData.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Preview ({parsedData.length} students)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Roll No</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((student, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{student.roll_no}</td>
                      <td className="px-4 py-2 text-gray-700">{student.name}</td>
                      <td className="px-4 py-2 text-gray-700">Year {student.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <p className="text-sm text-gray-600 mt-2">
                  ... and {parsedData.length - 10} more students
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition mt-4 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Upload {parsedData.length} Students</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
