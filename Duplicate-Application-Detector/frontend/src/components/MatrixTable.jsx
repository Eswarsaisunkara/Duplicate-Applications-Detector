export default function MatrixTable({ matrix, files }) {
  if (!matrix || matrix.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Similarity Matrix</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2">File</th>
              {files.map((file, i) => (
                <th key={i} className="border px-3 py-2">{file}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <td className="border px-3 py-2 font-medium">{files[i]}</td>
                {row.map((val, j) => (
                  <td key={j} className="border px-3 py-2 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-red-500 h-4 rounded-full"
                        style={{ width: `${val}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1">{val}%</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
