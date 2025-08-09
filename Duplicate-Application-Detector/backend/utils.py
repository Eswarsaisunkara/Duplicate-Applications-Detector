import pandas as pd
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter

def save_as_excel(matrix, filenames, filepath):
    df = pd.DataFrame(matrix, index=filenames, columns=filenames)
    df.to_excel(filepath, index=True)

def save_as_pdf(matrix, filenames, filepath):
    doc = SimpleDocTemplate(filepath, pagesize=letter)

    data = [["File"] + filenames] + [
        [filenames[i]] + row for i, row in enumerate(matrix)
    ]

    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER')
    ])
    table = Table(data)
    table.setStyle(style)
    doc.build([table])
