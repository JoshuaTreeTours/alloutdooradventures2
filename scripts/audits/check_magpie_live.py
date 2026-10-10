"""Live URL/booking link verifier for the 100-row Magpie cohort.
Run: python -m pip install requests beautifulsoup4
     python check_magpie_live.py magpie_urls_to_check.csv
Results: magpie_live_results.csv (HTTP evidence; review ambiguous SPA/JS cases manually)
"""
import csv,sys,time,re
from urllib.parse import urlparse,urljoin
import requests
from bs4 import BeautifulSoup

SOURCE=sys.argv[1] if len(sys.argv)>1 else 'magpie_urls_to_check.csv'
OUTPUT='magpie_live_results.csv'
HEADERS={'User-Agent':'Mozilla/5.0 (compatible; MagpieTourURLVerifier/1.0; audit request)'}
SESSION=requests.Session();SESSION.headers.update(HEADERS)

def get(url):
    try:
        r=SESSION.get(url,timeout=(8,22),allow_redirects=True)
        return r,None
    except requests.RequestException as exc:
        return None,str(exc)[:280]

def booking_links(soup,page):
    found=[]
    for a in soup.select('a[href]'):
        href=urljoin(page,a.get('href',''))
        text=a.get_text(' ',strip=True).lower()
        domain=urlparse(href).hostname or ''
        if ('fareharbor.com' in domain or 'viator.com' in domain or 'rezgo.com' in domain
            or re.search(r'check availability|book now|reserve now|book tour|book tickets',text)):
            if href.startswith('http') and href not in found:found.append(href)
    return found[:6]

with open(SOURCE,newline='',encoding='utf-8-sig') as f:rows=list(csv.DictReader(f))
fields=['product_id','tour_title','original_url','http_status','final_url','redirected','page_title','tour_id_in_html','booking_links_found','booking_url_tested','booking_http_status','booking_final_url','classification','error']
with open(OUTPUT,'w',newline='',encoding='utf-8-sig') as f:
 writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
 for i,row in enumerate(rows,1):
    url=row['landing_page_url'];pid=row['internal_id']; title=row['name'];r,err=get(url)
    out=dict(product_id=pid,tour_title=title,original_url=url,http_status='',final_url='',redirected='',page_title='',tour_id_in_html='',booking_links_found='',booking_url_tested='',booking_http_status='',booking_final_url='',classification='',error=err or '')
    if r is None:out['classification']='NETWORK ERROR — retry'
    else:
       out['http_status']=r.status_code;out['final_url']=r.url;out['redirected']='yes' if r.url.rstrip('/')!=url.rstrip('/') else 'no'
       soup=BeautifulSoup(r.text,'html.parser');out['page_title']=soup.title.get_text(' ',strip=True)[:150] if soup.title else ''
       suffix=urlparse(url).path.split('/')[-1].split('-')[-1]
       out['tour_id_in_html']='yes' if suffix and suffix.lower() in r.text.lower() else 'no'
       links=booking_links(soup,r.url);out['booking_links_found']=' | '.join(links)
       if r.status_code>=400:out['classification']='LANDING PAGE HTTP ERROR — review/remove'
       elif not links:
           out['classification']='HTTP OK, NO STATIC BOOKING LINK — manual JS review'
       else:
           out['classification']='HTTP OK, BOOKING LINK PRESENT — verify checkout'
           target=links[0];out['booking_url_tested']=target
           br,be=get(target)
           if br is not None:
               out['booking_http_status']=br.status_code;out['booking_final_url']=br.url
               if br.status_code>=400:out['classification']='BOOKING DESTINATION HTTP ERROR — review/remove'
           else:
               out['error']=f'booking fetch: {be}'
               out['classification']='BOOKING FETCH BLOCKED — manual review'
       if r.status_code==200 and out['tour_id_in_html']=='no':
           out['classification']+='; CHECK PRODUCT ID/SPA FALLBACK'
    writer.writerow(out);f.flush()
    print(f'{i:3}/{len(rows)} {pid:>16} {out["http_status"]!s:>3} {out["classification"]}',flush=True)
    time.sleep(.25)
print('Saved:',OUTPUT)