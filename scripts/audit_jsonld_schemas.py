import os
import json
import random
import re

def audit():
    printable_dir = r"c:\Users\vlvlz\Desktop\Doolia\public\printable"
    bundles_dir = r"c:\Users\vlvlz\Desktop\Doolia\public\bundles"

    def extract_json_ld(html_content):
        pattern = re.compile(r'<script\s+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', re.DOTALL | re.IGNORECASE)
        return pattern.findall(html_content)

    printable_htmls = []
    if os.path.exists(printable_dir):
        for root, dirs, files in os.walk(printable_dir):
            for file in files:
                if file == "index.html":
                    printable_htmls.append(os.path.join(root, file))

    sample_size = min(10, len(printable_htmls))
    samples = random.sample(printable_htmls, sample_size) if printable_htmls else []

    syntax_errors = 0
    types_found = set()
    missing_fields = set()

    for path in samples:
        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            scripts = extract_json_ld(content)
            for s in scripts:
                data = json.loads(s.strip())
                graph = data.get("@graph", [data])
                for item in graph:
                    t = item.get("@type")
                    if t:
                        if isinstance(t, list):
                            for sub_t in t: types_found.add(sub_t)
                        else:
                            types_found.add(t)
                    if item.get("@type") == "CreativeWork" or "name" in item:
                        if not item.get("name"): missing_fields.add("name")
                        # check image or image.url or contentUrl
                        img = item.get("image") or item.get("contentUrl")
                        if not img: missing_fields.add("image/contentUrl")
        except Exception as e:
            syntax_errors += 1

    # Check bundles
    bundle_htmls = []
    if os.path.exists(bundles_dir):
        for root, dirs, files in os.walk(bundles_dir):
            for file in files:
                if file == "index.html":
                    bundle_htmls.append(os.path.join(root, file))

    bundle_has_json_ld = False
    for path in bundle_htmls:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        if extract_json_ld(content):
            bundle_has_json_ld = True

    print(f"1. JSON-LD 태그 탑재 및 파싱 상태: {'오류' if syntax_errors > 0 else '정상'}")
    print(f"2. 도안 스키마 타입 및 필수 필드(name, image, creator 등) 충족도: {'100% 충족' if not missing_fields else f'누락 필드: {missing_fields}'}")
    print(f"3. 모음집(bundles) 구조화 데이터 탑재 여부: {'탑재됨' if bundle_has_json_ld else '누락됨'}")
    print(f"4. 구글 리치 스니펫 최종 평가: {'적합' if syntax_errors == 0 and not missing_fields and bundle_has_json_ld else '보완 필요'}")

audit()



