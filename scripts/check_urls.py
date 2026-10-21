import os
import glob
import re

def audit():
    printable_files = glob.glob("public/printable/*/index.html")[:5]
    bundle_files = glob.glob("public/bundles/*/index.html")
    
    print(f"Auditing {len(printable_files)} printable and {len(bundle_files)} bundle files.")
    
    all_files = printable_files + bundle_files
    for fpath in all_files:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            
            t_match = re.search(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']', content, re.I)
            img_match = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']', content, re.I)
            desc_match = re.search(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']+)["\']', content, re.I)
            url_match = re.search(r'<meta[^>]+property=["\']og:url["\'][^>]+content=["\']([^"\']+)["\']', content, re.I)
            can_match = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']', content, re.I)
            
            print(f"FILE: {fpath}")
            print(f"  Title: {t_match.group(1) if t_match else 'MISSING'}")
            print(f"  Image: {img_match.group(1) if img_match else 'MISSING'}")
            print(f"  Desc:  {desc_match.group(1) if desc_match else 'MISSING'}")
            print(f"  URL:   {url_match.group(1) if url_match else 'MISSING'}")
            print(f"  Canon: {can_match.group(1) if can_match else 'MISSING'}")

if __name__ == '__main__':
    audit()
