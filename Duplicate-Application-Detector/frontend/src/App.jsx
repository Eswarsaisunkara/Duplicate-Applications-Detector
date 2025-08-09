import { useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import MatrixTable from './components/MatrixTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [files, setFiles] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const acceptedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => acceptedTypes.includes(file.type));
    const invalidFiles = selectedFiles.filter(file => !acceptedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      toast.error(`Unsupported file type(s): ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) uploaded successfully.`);
    }
  };

  const removeFile = (name) => {
    setFiles(prev => prev.filter(file => file.name !== name));
  };

  const resetAll = async () => {
  try {
    await axios.post('http://localhost:5000/api/reset');
    toast.success("Files deleted from server.");
  } catch (err) {
    toast.error("Failed to delete files on server.");
  }

  setFiles([]);
  setMatrix([]);
  setFileList([]);
  setSearchQuery('');
  toast.info("Upload reset.");
};


  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCheckSimilarity = async () => {
    if (files.length === 0) {
      toast.warn("No files to process!");
      return;
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/similarity', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMatrix(res.data.matrix);
      setFileList(res.data.files);
      toast.success("Similarity matrix generated.");
    } catch (err) {
      toast.error("Error generating similarity matrix.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type) => {
    if (files.length === 0) {
      toast.warn("No files to download from!");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      for (let file of files) {
        formData.append('files', file);
      }

      const res = await axios.post(`http://localhost:5000/api/download/${type}`, formData, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: type === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `similarity_matrix.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${type.toUpperCase()} file downloaded.`);
    } catch (err) {
      toast.error(`Failed to download ${type} file.`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ToastContainer position="top-center" />
      <div className="w-full">
        <Navbar />
      </div>

      <div className="flex flex-1">
        <div className="w-64 bg-emerald-100 shadow-md p-4 space-y-4">
          <h2 className="text-xl font-semibold">Actions</h2>
          <button
            onClick={handleCheckSimilarity}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Check Similarity'}
          </button>
          <button
            onClick={() => handleDownload('excel')}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            Download Excel
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            disabled={loading}
          >
            Download PDF
          </button>
          <button
            onClick={resetAll}
            className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
          >
            Reset
          </button>
        </div>

        <div className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center font-montserrat">
              Upload documents and find similar or duplicate files easily.
            </h2>

            <div className="border-2 border-dashed border-blue-400 p-4 rounded-xl bg-blue-50 mb-3">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-100 file:text-blue-700
                  hover:file:bg-blue-200"
                onChange={handleFileUpload}
              />
              <p className="mt-2 text-xs font-bold text-red-600">
                Only .pdf, .docx, .txt files are allowed.
              </p>
            </div>

            <div className="relative w-1/2 mx-auto">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.6 3.6a7.5 7.5 0 0013.05 13.05z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
              />
            </div>

            <div className="bg-white border rounded p-4 mb-6 mt-4 max-h-64 overflow-y-auto">
              {files.length === 0 ? (
                <p className="text-gray-500">No files uploaded yet.</p>
              ) : filteredFiles.length === 0 ? (
                <p className="text-red-500">No files match your search.</p>
              ) : (
                filteredFiles.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b py-1">
                    <span>{file.name}</span>
                    <button
                      onClick={() => removeFile(file.name)}
                      className="text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ))
              )}
            </div>

            <MatrixTable matrix={matrix} files={fileList} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
