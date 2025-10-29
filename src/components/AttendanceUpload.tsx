import { useState } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

interface ParsedRecord {
  rollNo: string;
  date: string;
  subject: string;
  status: string;
}

export default function AttendanceUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewData, setPreviewData] = useState<ParsedRecord[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      setPreviewData([]);
    }
  };

  const parseFile = async (file: File): Promise<ParsedRecord[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          const records: ParsedRecord[] = jsonData.map((row: any) => ({
            rollNo: row.RollNo || row.rollNo || row.roll_no || '',
            date: row.Date || row.date || '',
            subject: row.Subject || row.subject || '',
            status: row.Status || row.status || '',
          }));

          const invalidRecords = records.filter(
            r => !r.rollNo || !r.date || !r.subject || !r.status
          );

          if (invalidRecords.length > 0) {
            reject(new Error('Invalid file format. Ensure all rows have RollNo, Date, Subject, and Status columns.'));
          }

          const invalidStatus = records.filter(
            r => r.status !== 'Present' && r.status !== 'Absent'
          );

          if (invalidStatus.length > 0) {
            reject(new Error('Status must be either "Present" or "Absent"'));
          }

          resolve(records);
        } catch (error) {
          reject(new Error('Failed to parse file. Please ensure it is a valid Excel or CSV file.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const records = await parseFile(file);
      setPreviewData(records);

      const { data: user } = await supabase.auth.getUser();

      const attendanceRecords = records.map(r => ({
        roll_no: r.rollNo,
        date: r.date,
        subject: r.subject,
        status: r.status,
        created_by: user.user?.id,
      }));

      const { error } = await supabase
        .from('attendance_records')
        .insert(attendanceRecords);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Successfully uploaded ${records.length} attendance records!`
      });
      setFile(null);

      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload attendance records' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`px-4 py-3 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          <span>File Format Requirements</span>
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>Your Excel/CSV file must contain the following columns:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>RollNo</strong> - Student roll number</li>
            <li><strong>Date</strong> - Attendance date (YYYY-MM-DD format)</li>
            <li><strong>Subject</strong> - Subject/Class name</li>
            <li><strong>Status</strong> - Either "Present" or "Absent"</li>
          </ul>
          <div className="mt-4 bg-white p-3 rounded border border-blue-300">
            <p className="font-medium mb-2">Example:</p>
            <table className="text-xs w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">RollNo</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Subject</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">21A91A01A1</td>
                  <td className="border px-2 py-1">2025-10-28</td>
                  <td className="border px-2 py-1">Maths</td>
                  <td className="border px-2 py-1">Present</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">21A91A01A1</td>
                  <td className="border px-2 py-1">2025-10-28</td>
                  <td className="border px-2 py-1">Physics</td>
                  <td className="border px-2 py-1">Absent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition">
        <input
          id="file-upload"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center space-y-3"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <span className="text-blue-600 hover:text-blue-700 font-medium">
              Click to upload
            </span>
            <span className="text-gray-600"> or drag and drop</span>
          </div>
          <p className="text-sm text-gray-500">Excel or CSV files only</p>
        </label>
      </div>

      {file && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </button>
          </div>
        </div>
      )}

      {previewData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Upload Preview ({previewData.length} records)</h4>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Roll No</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((record, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{record.rollNo}</td>
                    <td className="px-4 py-2">{record.date}</td>
                    <td className="px-4 py-2">{record.subject}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <p className="text-center text-gray-500 text-sm mt-2">
                ...and {previewData.length - 10} more records
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
