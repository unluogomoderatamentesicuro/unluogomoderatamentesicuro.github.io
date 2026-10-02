"""Crea dist/athanor.html: tutta la pagina in un unico file (CSS e JS in linea).
Utile per caricarla dove non si possono mettere cartelle.  python3 build.py"""
import re, pathlib
root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'css/athanor.css').read_text(encoding='utf-8')
html = re.sub(r'<link rel="stylesheet" href="css/athanor\.css(\?v=\d+)?">', lambda m: '<style>\n' + css + '\n</style>', html)
def inline(m):
    js = (root / m.group(1)).read_text(encoding='utf-8').replace('</script', '<\\/script')
    return '<script>\n' + js + '\n</script>'
html = re.sub(r'<script src="(js/[^"?]+)(\?v=\d+)?"></script>', inline, html)
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist/athanor.html').write_text(html, encoding='utf-8')
print('Creato dist/athanor.html', len(html), 'byte')
