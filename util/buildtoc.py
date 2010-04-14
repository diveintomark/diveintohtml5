#!/usr/bin/python3

import re
import roman

# get list of chapters
chapters = []
for line in open('index.html'):
    if not line.count('<li') or not line.count('<a href'): continue
    chapters.append(line.split('<a href=', 1)[1].split('>', 1)[0])
sections = {}

for filename in chapters:
    chapter_id = filename.split(".", 1)[0]
    with open(filename, encoding="utf-8") as f: data = f.read()
    sections[chapter_id] = re.findall("<h2 id=(.*?)>(.*?)</h2>", data)

with open('index.html', encoding="utf-8") as f: data = f.read()
short_toc = data.split('<!-- toc -->')[1].split('<!-- /toc -->')[0]

full_toc = ['<!-- toc -->']
chapter_id = ''
for line in short_toc.splitlines():
    if line.count('<li') and line.count('<a href'):
        chapter_id = line.split('<a href=', 1)[1].split('.', 1)[0]
        line = line.replace('<li>', '<li id={0}>'.format(chapter_id))
    full_toc.append(line)
    if chapter_id:
        full_toc.append('<ol>')
        section_number = 0
        for section_id, section_title in sections[chapter_id]:
            section_number += 1
            full_toc.append('<li><dl><dt><a href={0}.html#{1}>{2}</a><dd>{3}</dl>'.format(chapter_id, section_id, section_title, roman.to_roman(section_number).lower()))
        full_toc.append('</ol>')
        chapter_id = ''
full_toc.append('<!-- /toc -->')
with open('table-of-contents.html', encoding="utf-8") as f: data = f.read()
with open('table-of-contents.html', mode="w", encoding="utf-8") as f:
    f.write(data.split('<!-- toc -->')[0] + "\n".join(full_toc) + data.split('<!-- /toc -->')[1])
