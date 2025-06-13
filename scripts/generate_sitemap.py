```python
import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime
import xml.etree.ElementTree as ET
import xml.dom.minidom
import os

# Firebase initialization
cred = credentials.Certificate("firebase-credentials.json")
try:
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://btc3-d7d9b-default-rtdb.firebaseio.com'
    })
except ValueError:
    pass

def generate_job_sitemap():
    """Generate sitemap for job listings"""
    urlset = ET.Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    
    # Fetch all active jobs
    jobs_ref = db.reference('jobs')
    jobs = jobs_ref.get()
    
    if jobs:
        for job_id, job in jobs.items():
            # Skip inactive jobs
            if job.get('status') != 'active':
                continue
            
            # Create URL-friendly slug from job title
            title = job.get('title', '').lower()
            slug = ''.join(c if c.isalnum() or c.isspace() else '-' for c in title)
            slug = '-'.join(slug.split())
            
            # Create URL element
            url = ET.SubElement(urlset, 'url')
            ET.SubElement(url, 'loc').text = f'https://isilanlarim.org/ilan/{slug}/{job_id}'
            ET.SubElement(url, 'changefreq').text = 'daily'
            ET.SubElement(url, 'priority').text = '0.8'
            
            # Add last modified date
            lastmod = datetime.fromtimestamp(
                job.get('updatedAt', job.get('createdAt', 0)) / 1000
            ).strftime('%Y-%m-%d')
            ET.SubElement(url, 'lastmod').text = lastmod
    
    # Save jobs sitemap
    xmlstr = xml.dom.minidom.parseString(ET.tostring(urlset)).toprettyxml(indent='  ')
    with open('public/sitemap-jobs.xml', 'w', encoding='utf-8') as f:
        f.write(xmlstr)

def generate_sitemap_index():
    """Generate sitemap index file"""
    sitemapindex = ET.Element('sitemapindex')
    sitemapindex.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Add static sitemap
    sitemap = ET.SubElement(sitemapindex, 'sitemap')
    ET.SubElement(sitemap, 'loc').text = 'https://isilanlarim.org/sitemap-static.xml'
    ET.SubElement(sitemap, 'lastmod').text = today
    
    # Add jobs sitemap
    sitemap = ET.SubElement(sitemapindex, 'sitemap')
    ET.SubElement(sitemap, 'loc').text = 'https://isilanlarim.org/sitemap-jobs.xml'
    ET.SubElement(sitemap, 'lastmod').text = today
    
    # Save sitemap index
    xmlstr = xml.dom.minidom.parseString(ET.tostring(sitemapindex)).toprettyxml(indent='  ')
    with open('public/sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(xmlstr)

if __name__ == '__main__':
    # Generate job listings sitemap
    generate_job_sitemap()
    
    # Generate sitemap index
    generate_sitemap_index()
    
    print("Sitemaps generated successfully")
```