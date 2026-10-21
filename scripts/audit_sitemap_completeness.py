import os
import xml.etree.ElementTree as ET

sitemap_path = "public/sitemap.xml"
if not os.path.exists(sitemap_path):
    sitemap_path = "dist/sitemap.xml"

print(f"Checking sitemap at: {sitemap_path}")

try:
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    
    # Handle XML namespaces if any
    # sitemaps usually have xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" and xhtml namespace
    namespaces = {
        'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        'xhtml': 'http://www.w3.org/1999/xhtml'
    }
    
    urls = root.findall('{http://www.sitemaps.org/schemas/sitemap/0.9}url')
    if not urls:
        # try without namespace or default
        urls = root.findall('url')
    
    total_urls = len(urls)
    printable_count = 0
    bundles_list_found = False
    bundles_detail_count = 0
    
    subpages_to_check = ['/about', '/contact', '/report', '/category', '/faq', '/privacy']
    found_subpages = {p: False for p in subpages_to_check}
    
    languages_checked_all = True
    # Check if each url has hreflang links (or xhtml:link)
    # Typically 10 languages, let's inspect the count of xhtml:link or alternate links per url
    
    for url_elem in urls:
        loc_elem = url_elem.find('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')
        if loc_elem is None:
            loc_elem = url_elem.find('loc')
        
        if loc_elem is not None and loc_elem.text:
            loc = loc_elem.text.strip()
            if '/printable/' in loc:
                printable_count += 1
            elif loc == 'https://doolia.app/bundles' or loc == 'https://doolia.app/bundles/' or loc == 'https://www.doolia.app/bundles' or loc == 'https://www.doolia.app/bundles/':
                bundles_list_found = True
            elif '/bundles/' in loc:
                bundles_detail_count += 1
            
            for sp in subpages_to_check:
                if loc.endswith(sp) or loc.endswith(sp + '/'):
                    found_subpages[sp] = True
        
        # Check alternate links
        xhtml_links = url_elem.findall('{http://www.w3.org/1999/xhtml}link')
        if not xhtml_links:
            # try without prefix or different namespace search
            xhtml_links = [elem for elem in url_elem if 'link' in elem.tag]
            
        if len(xhtml_links) < 10:
            languages_checked_all = False

    print(f"Total URLs: {total_urls}")
    print(f"Printable count: {printable_count}")
    print(f"Bundles list found: {bundles_list_found}")
    print(f"Bundles detail count: {bundles_detail_count}")
    print(f"Found subpages: {found_subpages}")
    print(f"Languages checked all (>=10 links per url): {languages_checked_all}")

except Exception as e:
    print(f"Error parsing sitemap: {e}")
