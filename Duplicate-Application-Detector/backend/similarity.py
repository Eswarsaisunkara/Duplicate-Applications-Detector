import os
import difflib
from docx import Document
import PyPDF2

def read_txt(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def read_docx(file_path):
    doc = Document(file_path)
    return '\n'.join(p.text for p in doc.paragraphs)

def read_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() or ""
    return text

def read_content(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        return read_txt(file_path)
    elif ext == ".docx":
        return read_docx(file_path)
    elif ext == ".pdf":
        return read_pdf(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_path}")

def similarity_score(text1, text2):
    return round(difflib.SequenceMatcher(None, text1, text2).ratio() * 100, 2)

def calculate_similarity_matrix(file_paths):   # Renamed function
    contents = []
    for fp in file_paths:
        content = read_content(fp)
        if not content.strip():
            raise ValueError(f"Empty or unreadable content in file: {fp}")
        contents.append(content)

    n = len(contents)
    matrix = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i <= j:
                score = similarity_score(contents[i], contents[j])
                matrix[i][j] = matrix[j][i] = score

    filenames = [os.path.basename(fp) for fp in file_paths]
    return matrix, filenames
