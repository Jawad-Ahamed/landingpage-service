"""Build a single-file, shareable copy of the landing page.

Inlines assets/styles.css, assets/app.js, the brand and integration logos, the poster and the
walkthrough video as data URIs, so the output opens on its own (only Google Fonts loads from the web).

Usage:  python3 tools/bundle.py [output.html]
Default output: ~/Downloads/MetaWurks landing page (current build).html
(It never overwrites the client's reference file "MetaWurks landing page_ redesign preview.html".)
"""
import re, base64, sys, os
# the static original lives in legacy/ since the site moved to Next.js
root = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'legacy')
out = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Downloads/MetaWurks landing page (current build).html')
html=open(f'{root}/index.html',encoding='utf-8').read()
css=open(f'{root}/assets/styles.css',encoding='utf-8').read()
js=open(f'{root}/assets/app.js',encoding='utf-8').read()
MIME={'png':'image/png','svg':'image/svg+xml','jpg':'image/jpeg','jpeg':'image/jpeg','mp4':'video/mp4'}
cache={}
def datauri(path):
    if path not in cache:
        ext=path.rsplit('.',1)[1].lower()
        b=open(f'{root}/{path}','rb').read()
        cache[path]=f'data:{MIME[ext]};base64,'+base64.b64encode(b).decode()
    return cache[path]
asset_re=re.compile(r'(assets/(?:brand|logos)/[A-Za-z0-9_.-]+\.(?:png|svg)|assets/metawurks-[a-z]+\.(?:jpg|mp4))(?:\?v=\d+)?')
# head: preview title, drop the image preload (pointless once inlined)
html=html.replace('<title>MetaWurks — ','<title>MetaWurks (current build) — ',1)
html=re.sub(r'\s*<link rel="preload" as="image" href="assets/metawurks-poster.jpg">','',html)
# stylesheet and script inline
html=re.sub(r'<link rel="stylesheet" href="assets/styles\.css\?v=\d+">', lambda m: '<style id="mw-css">\n'+css+'\n</style>', html)
html=re.sub(r'<script src="assets/app\.js\?v=\d+" defer></script>', lambda m: '<script id="mw-js">\n'+js.replace('</script','<\\/script')+'\n</script>', html)
assert 'id="mw-css"' in html and 'id="mw-js"' in html
html=asset_re.sub(lambda m: datauri(m.group(1)), html)
left=re.findall(r'["\'(]assets/[^"\')]+',html)
assert not left, left[:5]
open(out,'w',encoding='utf-8').write(html)
print('wrote', out, len(html), 'bytes;', len(cache), 'assets inlined')
