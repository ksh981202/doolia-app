import os
import urllib.request
import urllib.parse
import json

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if not os.path.exists(env_path):
        env_path = '.env'
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as ef:
            for line in ef:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    env_vars[key.strip()] = val.strip()
    return env_vars

def audit_trademarks():
    env_vars = load_env()
    supabase_url = env_vars.get('SUPABASE_URL') or env_vars.get('VITE_SUPABASE_URL')
    supabase_key = env_vars.get('SUPABASE_SERVICE_KEY') or env_vars.get('VITE_SUPABASE_ANON_KEY')
    if not supabase_url or not supabase_key:
        print('Error: Supabase URL or Key not found')
        return
    blacklist = ['thomas', '토마스', 'tayo', '타요', 'chuggington', 'transformer', 'bumblebee', 'optimus', '트랜스포머', '범블비', '옵티머스', 'gundam', '건담', 'tobot', '또봇', 'carbot', '카봇', 'disney', '디즈니', 'mickey', '미키', 'pokemon', '포켓몬', 'pikachu', '피카츄', 'sanrio', '산리오', 'kitty', '키티', 'pororo', '뽀로로', 'paw patrol', 'doraemon', 'marvel', '마블', 'spiderman', '스파이더맨', 'batman', '배트맨', 'ironman', '아이언맨', 'ferrari', 'lamborghini', 'lego', '레고']
    total_checked = 0
    violations = []
    limit = 500
    offset = 0
    while True:
        url = '{}/rest/v1/printables?select=id,slug,title_ko,title_en,description_ko,parent_guide_ko,tags&limit={}&offset={}'.format(supabase_url, limit, offset)
        req = urllib.request.Request(url, headers={
            'apikey': supabase_key,
            'Authorization': 'Bearer ' + supabase_key,
            'Range-Unit': 'items',
            'Range': '{}-{}'.format(offset, offset + limit - 1)
        })
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                if not data:
                    break
                for item in data:
                    total_checked += 1
                    slug = item.get('slug', 'id_' + str(item.get('id')))
                    for field in ['slug', 'title_ko', 'title_en', 'description_ko', 'parent_guide_ko', 'tags']:
                        val = item.get(field)
                        if not val:
                            continue
                        val_str = ' '.join(str(v) for v in val) if isinstance(val, list) else str(val)
                        val_lower = val_str.lower()
                        for kw in blacklist:
                            if kw in val_lower:
                                violations.append((item.get('id'), slug, kw, field))
                if len(data) < limit:
                    break
                offset += limit
        except Exception as e:
            print('Error:', e)
            break
    print('- 총 검사된 도안 수:', total_checked)
    print('- 검출된 위험 상표권 건수:', len(violations))
    if len(violations) == 0:
        print('- 위험 단어 0건 (100% 안전)')
    else:
        details = ['{} ({} in {})'.format(v[1], v[2], v[3]) for v in violations]
        print('- 검출 목록:', ', '.join(details))

if __name__ == '__main__':
    audit_trademarks()
