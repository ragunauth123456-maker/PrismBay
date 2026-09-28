#!/usr/bin/env python3
import io, json, os, re, sys, time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from PIL import Image
from pypdf import PdfReader, PdfWriter

BASE = os.environ.get("FLIP_URL", "https://online.fliphtml5.com/jeign/MI05/").split("#")[0].rstrip("/") + "/"
OUT = Path(os.environ.get("OUT_DIR", "/tmp/fliphtml5_extract"))
OUT.mkdir(parents=True, exist_ok=True)
KEYWORDS = [r"\bAGM\b", r"AGM\s*Inc", r"Aurora\s+Gold", r"Aurora\s+Gold\s+Mine", r"Zijin"]
ANCHOR = int(os.environ.get("ANCHOR_PAGE", "45"))

S = requests.Session()
S.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129 Safari/537.36",
    "Referer": BASE,
    "Accept": "*/*",
})

def get(url, timeout=25):
    try:
        r = S.get(url, timeout=timeout, allow_redirects=True)
        return r
    except Exception as e:
        print("GET failed", url, e, file=sys.stderr)
        return None

def head(url, timeout=15):
    try:
        return S.head(url, timeout=timeout, allow_redirects=True)
    except Exception:
        return None

def fetch_text(url):
    r = get(url)
    if r is not None and r.status_code == 200:
        return r.text
    return ""

def find_official_pdf(texts):
    urls = []
    for text in texts:
        if not text:
            continue
        for m in re.finditer(r'''(?i)(https?:\\/\\/[^"'<> ]+?\.pdf(?:\?[^"'<> ]*)?|[A-Za-z0-9_./%-]+\.pdf(?:\?[^"'<> ]*)?)''', text):
            raw = m.group(1).replace("\\/","/")
            u = raw if raw.startswith("http") else urljoin(BASE, raw)
            if u not in urls:
                urls.append(u)
    for u in urls:
        r = get(u, 45)
        if r is not None and r.status_code == 200 and r.content[:4] == b"%PDF":
            p = OUT / "source_official.pdf"
            p.write_bytes(r.content)
            print("OFFICIAL_PDF", u)
            return p, u
    return None, None

def parse_total_pages(texts):
    pats = [
        r'"totalPageNum"\s*:\s*(\d+)',
        r'"totalPageCount"\s*:\s*(\d+)',
        r'"pageCount"\s*:\s*(\d+)',
        r'totalPageNum\s*=\s*(\d+)',
        r'totalPageCount\s*=\s*(\d+)',
    ]
    vals=[]
    for t in texts:
        for p in pats:
            for m in re.finditer(p,t or ""):
                try: vals.append(int(m.group(1)))
                except: pass
    return max(vals) if vals else None

def parse_page_list(texts):
    candidates=[]
    for t in texts:
        if not t: continue
        # pageList array in old and new configs.
        for m in re.finditer(r'"pageList"\s*:\s*\[(.*?)\]', t, re.S):
            block=m.group(1)
            vals=re.findall(r'"([^"]+)"', block)
            if len(vals)>5:
                candidates.append(vals)
        # Direct large-page paths.
        vals=re.findall(r'files/(?:large|page|mobile)/([^"\']+?\.(?:jpg|jpeg|png|webp))', t, re.I)
        if len(vals)>5:
            candidates.append(vals)
    if not candidates:
        return []
    vals=max(candidates,key=len)
    out=[]
    for v in vals:
        if v.startswith("files/"):
            out.append(urljoin(BASE,v))
        else:
            out.append(urljoin(BASE,"files/large/"+v))
    return out

def probe_pattern():
    patterns = [
        ("files/large/{n}.jpg", lambda n:n),
        ("files/large/{n}.webp", lambda n:n),
        ("files/page/{n}.jpg", lambda n:n),
        ("files/page/{n}.webp", lambda n:n),
        ("files/mobile/{n}.jpg", lambda n:n),
        ("files/assets/pages/page{n:04d}_l.jpg", lambda n:n),
        ("files/assets/pages/page{n:04d}.jpg", lambda n:n),
        ("files/assets/pages/page{n:04d}_l.webp", lambda n:n),
    ]
    for pattern,_ in patterns:
        for test in [ANCHOR,1]:
            u=urljoin(BASE,pattern.format(n=test))
            r=get(u,20)
            if r is not None and r.status_code==200 and r.content and (
                "image" in r.headers.get("content-type","").lower() or r.content[:4] in (b"RIFF", b"\xff\xd8\xff\xe0", b"\x89PNG")
            ):
                print("IMAGE_PATTERN", pattern)
                return pattern
    return None

def image_urls(total, page_list, pattern):
    if page_list:
        return {i+1:u for i,u in enumerate(page_list)}
    if not pattern:
        return {}
    if total:
        rng=range(1,total+1)
    else:
        rng=range(max(1,ANCHOR-25),ANCHOR+41)
    return {n:urljoin(BASE,pattern.format(n=n)) for n in rng}

def download_images(urls):
    imgdir=OUT/"pages"
    imgdir.mkdir(exist_ok=True)
    downloaded={}
    for n,u in urls.items():
        p=imgdir/f"{n:04d}.img"
        r=get(u,40)
        if r is None or r.status_code!=200 or len(r.content)<5000:
            continue
        ctype=r.headers.get("content-type","").lower()
        ext=".webp" if "webp" in ctype else ".png" if "png" in ctype else ".jpg"
        p=p.with_suffix(ext)
        p.write_bytes(r.content)
        downloaded[n]=p
        print("PAGE",n,u)
    return downloaded

def pdftotext_pages(pdf):
    import subprocess
    txt=OUT/"source.txt"
    subprocess.run(["pdftotext","-layout",str(pdf),str(txt)],check=False)
    data=txt.read_text(errors="ignore") if txt.exists() else ""
    return data.split("\f")

def ocr_image(path):
    import subprocess, tempfile
    base=str(OUT/"ocr_tmp")
    res=subprocess.run(["tesseract",str(path),base,"-l","eng","--psm","6"],capture_output=True,text=True)
    txt=Path(base+".txt")
    out=txt.read_text(errors="ignore") if txt.exists() else ""
    try: txt.unlink()
    except: pass
    return out

def relevant_pages_from_text(page_texts):
    hits=[]
    compiled=[re.compile(k,re.I) for k in KEYWORDS]
    for i,t in enumerate(page_texts, start=1):
        if any(rx.search(t or "") for rx in compiled):
            hits.append(i)
    return hits

def extract_pdf_pages(pdf,hits,out_pdf):
    reader=PdfReader(str(pdf))
    writer=PdfWriter()
    for n in hits:
        if 1 <= n <= len(reader.pages):
            writer.add_page(reader.pages[n-1])
    with open(out_pdf,"wb") as f:
        writer.write(f)

def images_to_pdf(paths,out_pdf):
    ims=[]
    try:
        for p in paths:
            im=Image.open(p)
            if im.mode!="RGB": im=im.convert("RGB")
            ims.append(im.copy())
        if not ims: return False
        ims[0].save(out_pdf,save_all=True,append_images=ims[1:],resolution=180.0)
        return True
    finally:
        for im in ims:
            try: im.close()
            except: pass

def main():
    main_html=fetch_text(BASE)
    config_urls=[
        urljoin(BASE,"javascript/config.js"),
        urljoin(BASE,"config.js"),
        urljoin(BASE,"javascript/htmlConfig.js"),
        urljoin(BASE,"javascript/search_config.js"),
    ]
    texts=[main_html]
    for u in config_urls:
        t=fetch_text(u)
        if t:
            print("CONFIG",u,len(t))
            texts.append(t)
            (OUT/("config_"+str(len(texts))+".txt")).write_text(t,errors="ignore")

    official, official_url=find_official_pdf(texts)
    report={"base":BASE,"official_pdf_url":official_url,"keyword_hits":[],"selected_pages":[]}

    if official:
        pages=pdftotext_pages(official)
        hits=relevant_pages_from_text(pages)
        report["keyword_hits"]=hits
        # Keep exact keyword pages plus one-page continuity on both sides.
        selected=sorted({p for h in hits for p in (h-1,h,h+1) if 1<=p<=len(pages)})
        report["selected_pages"]=selected
        if selected:
            extract_pdf_pages(official,selected,OUT/"AGM_Inc_feature.pdf")
        (OUT/"report.json").write_text(json.dumps(report,indent=2))
        print(json.dumps(report,indent=2))
        return

    total=parse_total_pages(texts)
    plist=parse_page_list(texts)
    pattern=probe_pattern()
    print("TOTAL",total,"PAGELIST",len(plist),"PATTERN",pattern)
    urls=image_urls(total,plist,pattern)

    # If page count is large, first scan a wide band around the user's p45 anchor.
    if len(urls)>80:
        subset={n:u for n,u in urls.items() if max(1,ANCHOR-20)<=n<=ANCHOR+30}
    else:
        subset=urls
    imgs=download_images(subset)
    ocr={}
    for n,p in sorted(imgs.items()):
        t=ocr_image(p)
        ocr[n]=t
        (OUT/f"ocr_{n:04d}.txt").write_text(t,errors="ignore")
    compiled=[re.compile(k,re.I) for k in KEYWORDS]
    hits=[n for n,t in ocr.items() if any(rx.search(t) for rx in compiled)]
    report["keyword_hits"]=hits
    selected=sorted({p for h in hits for p in (h-1,h,h+1) if p in imgs})
    # Prefer a continuous feature if hits cluster near page 45.
    if hits:
        lo=max(min(imgs),min(hits)-1); hi=min(max(imgs),max(hits)+1)
        selected=[n for n in range(lo,hi+1) if n in imgs]
    report["selected_pages"]=selected
    if selected:
        images_to_pdf([imgs[n] for n in selected],OUT/"AGM_Inc_feature.pdf")
    (OUT/"report.json").write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))

if __name__=="__main__":
    main()
