from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
import os
import tempfile
from similarity import calculate_similarity_matrix
from utils import save_as_excel, save_as_pdf

app = Flask(__name__)
CORS(app)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt'}

last_uploaded_files = []

@app.route("/api/similarity", methods=["POST"])
def similarity_api():
    global last_uploaded_files
    last_uploaded_files = []

    if 'files' not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    files = request.files.getlist('files')

    for file in files:
        if file.filename:
            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                return jsonify({"error": f"Unsupported file format: {file.filename}"}), 400

            file_path = os.path.join(UPLOAD_DIR, file.filename)
            file.save(file_path)
            last_uploaded_files.append(file_path)

    try:
        matrix, filenames = calculate_similarity_matrix(last_uploaded_files)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"matrix": matrix, "files": filenames})


@app.route("/api/download/<string:filetype>", methods=["POST"])
def download(filetype):
    global last_uploaded_files

    if not last_uploaded_files:
        return jsonify({"error": "No uploaded files found for current session."}), 400

    if filetype not in ("excel", "pdf"):
        return jsonify({"error": "Invalid download type"}), 400

    try:
        matrix, filenames = calculate_similarity_matrix(last_uploaded_files)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    suffix = ".xlsx" if filetype == "excel" else ".pdf"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        if filetype == "excel":
            save_as_excel(matrix, filenames, tmp.name)
        else:
            save_as_pdf(matrix, filenames, tmp.name)

        tmp_path = tmp.name

    @after_this_request
    def remove_file(response):
        try:
            os.remove(tmp_path)
        except Exception as e:
            print(f"Failed to delete temp file: {e}")
        return response

    return send_file(
        tmp_path,
        as_attachment=True,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        if filetype == "excel" else "application/pdf"
    )

@app.route("/api/reset", methods=["POST"])
def reset_matrix():
    global last_matrix, last_filenames
    last_matrix = None
    last_filenames = None
    return jsonify({"message": "Reset successful"}), 200



if __name__ == "__main__":
    app.run(debug=True)
