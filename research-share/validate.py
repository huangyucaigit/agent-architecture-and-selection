"""Validate the three-page offline research collection; UI checks are recorded separately."""
from html.parser import HTMLParser
from collections import Counter
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json

class Audit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.anchors, self.assets, self.sections, self.slides, self.links = [], [], [], [], [], []
        self.cards = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        classes = a.get('class','').split()
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
            if a['href'].startswith('#'): self.anchors.append(a['href'][1:])
        if tag in ('script','img','iframe','audio','video','source') and a.get('src'): self.assets.append(a['src'])
        if tag == 'link' and a.get('href') and not a['href'].startswith('data:'): self.assets.append(a['href'])
        if tag == 'section' and 'data-nav' in a: self.sections.append(a['id'])
        if tag == 'section' and 'slide' in classes: self.slides.append(a['id'])
        if tag == 'a' and 'research-card' in classes: self.cards += 1

here = Path(__file__).resolve().parent
names = ['index.html','agent-research.html','dsh-meeting.html']
audits = {}
texts = {}
for name in names:
    texts[name] = (here/'dist'/name).read_text(encoding='utf-8')
    audits[name] = Audit()
    audits[name].feed(texts[name])
required = ['overview','reading'] + [f'q{i}' for i in range(1,11)] + ['cases','case-query','case-analysis','case-config','case-compare','takeaways','sources']
assert audits['agent-research.html'].sections == required
assert len(audits['dsh-meeting.html'].slides) == 8
assert audits['index.html'].cards == 2
placeholders = ['<!-- FOUNDATION_CONTENT -->','<!-- ECOLOGY_CONTENT -->','<!-- SELECTION_CONTENT -->','<!-- PRACTICE_CONTENT -->','<!-- ORIGINAL_RESEARCH -->','<!-- CASE_RESEARCH -->','<!-- STUDY_SWITCH -->','<!-- TAXONOMY_SLIDES -->','<!-- PORTAL_STYLE -->','<!-- LEGACY_REDIRECT -->']
result = {}
for name, audit in audits.items():
    duplicates = [i for i,n in Counter(audit.ids).items() if n>1]
    broken = [i for i in audit.anchors if unquote(i) not in audit.ids]
    cross_broken = []
    for href in audit.links:
        url = urlsplit(href)
        if url.scheme or url.netloc or not url.path: continue
        target = url.path.removeprefix('./')
        if target in audits:
            if url.fragment and unquote(url.fragment) not in audits[target].ids: cross_broken.append(href)
        elif url.path.endswith('.html'): cross_broken.append(href)
    unresolved = [p for p in placeholders if p in texts[name]]
    assert not duplicates, (name,duplicates)
    assert not broken, (name,broken)
    assert not cross_broken, (name,cross_broken)
    assert not audit.assets, (name,audit.assets)
    assert not unresolved, (name,unresolved)
    result[name] = {'bytes':(here/'dist'/name).stat().st_size,'duplicate_ids':duplicates,'broken_anchors':broken,'broken_page_links':cross_broken,'external_runtime_assets':audit.assets,'unresolved_placeholders':unresolved}
assert 'agent-research.html#overview' in audits['index.html'].links
assert 'dsh-meeting.html#paper' in audits['index.html'].links
for name in names[1:]:
    for href in ['index.html','agent-research.html#overview','dsh-meeting.html#paper']: assert href in audits[name].links
for id in required: assert json.dumps(id) in texts['index.html']
print(json.dumps({'research_topics':19,'dsh_slides':8,'portal_cards':2,'pages':result},ensure_ascii=False,indent=2))
