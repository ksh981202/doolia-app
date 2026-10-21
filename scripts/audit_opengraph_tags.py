import os
import glob
import re

def audit():
    printable_files = glob.glob("public/printable/*/index.html")
    bundle_files = glob.glob("public/bundles/*/index.html")
    
    print(f"Found {len(printable_files)} printable files and {len(bundle_files)} bundle files.")
    
    all_files = printable_files + bundle_files
    if not all_files:
        print("No files found matching the patterns!")
        return

    title_ok = True
    image_ok = True
    desc_ok = True
    url_ok = True
    bundle_complete = True

    def extract_meta(html, property_name):
        match = re.search(r'<meta\s+(?:property|name)=["\']' + property_name + r'["\']\s+content=["\']([^"\']*)["\']', html, re.IGNORECASE)
        if not match:
            match = re.search(r'<meta\s+content=["\']([^"\']*)["\']\s+(?:property|name)=["\']' + property_name + r'["\']', html, re.IGNORECASE)
        return match.group(1) if match else ""

    def extract_link(html, rel_name):
        match = re.search(r'<link\s+rel=["\']' + rel_name + r'["\']\s+href=["\']([^"\']*)["\']', html, re.IGNORECASE)
        return match.group(1) if match else ""

    for fpath in all_files:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            
            t_val = extract_meta(content, "og:title")
            tw_t_val = extract_meta(content, "twitter:title")
            img_val = extract_meta(content, "og:image")
            tw_img_val = extract_meta(content, "twitter:image")
            desc_val = extract_meta(content, "og:description")
            url_val = extract_meta(content, "og:url")
            can_val = extract_link(content, "canonical")
            
            print(f"\n--- File: {fpath} ---")
            print(f"  og:title: {t_val}")
            print(f"  twitter:title: {tw_t_val}")
            print(f"  og:image: {img_val}")
            print(f"  twitter:image: {tw_img_val}")
            print(f"  og:description: {desc_val}")
            print(f"  og:url: {url_val}")
            print(f"  canonical: {can_val}")

            # Check conditions
            if not t_val or "default" in t_val.lower():
                title_ok = False
            if not img_val or not (img_val.startswith("https://cdn.doolia.app") or img_val.startswith("https://pub-") or img_val.startswith("https://")):
                image_ok = False
            if not desc_val:
                desc_ok = False
            if not url_val or not url_val.startswith("https://doolia.app"):
                url_ok = False

    # Check bundle completeness specifically (all 6 bundles)
    if len(bundle_files) < 6:
        bundle_complete = False

    for fpath in bundle_files:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
            if not extract_meta(content, "og:title") or not extract_meta(content, "og:image") or not extract_meta(content, "og:url"):
                bundle_complete = False

    print("\n==============================")
    print("AUDIT SUMMARY:")
    print(f"Title Status: {title_ok}")
    print(f"Image Status: {image_ok}")
    print(f"Bundle Complete: {bundle_complete}")
    print(f"URL Status: {url_ok}")

if __name__ == "__main__":
    audit()
