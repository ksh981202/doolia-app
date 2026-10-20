import os
import urllib.request
import json

def load_env():
    env_path = '.env'
    if not os.path.exists(env_path):
        return
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                k, v = line.split('=', 1)
                os.environ[k.strip()] = v.strip()

load_env()
url = os.environ.get('VITE_SUPABASE_URL')
anon_key = os.environ.get('VITE_SUPABASE_ANON_KEY')

print(f'URL: {url}')

headers = {
    'apikey': anon_key,
    'Authorization': f'Bearer {anon_key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# 1. SELECT test
req_get = urllib.request.Request(f'{url}/rest/v1/printables?select=*&limit=1', headers=headers, method='GET')
try:
    with urllib.request.urlopen(req_get) as resp:
        data = json.loads(resp.read().decode())
        print(f'SELECT status: 200, rows returned: {len(data)}')
        select_allowed = True
except Exception as e:
    print(f'SELECT failed: {e}')
    select_allowed = False

# 2. INSERT test
data_insert = json.dumps({'title': 'security_test_dummy'}).encode('utf-8')
req_post = urllib.request.Request(f'{url}/rest/v1/printables', data=data_insert, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req_post) as resp:
        print(f'INSERT status: {resp.status}')
        insert_allowed = True
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'INSERT blocked (Expected): HTTP {e.code} - {body}')
    insert_allowed = False
except Exception as e:
    print(f'INSERT failed: {e}')
    insert_allowed = False

# 3. UPDATE test
data_update = json.dumps({'title': 'updated_title'}).encode('utf-8')
req_patch = urllib.request.Request(f'{url}/rest/v1/printables?id=eq.1', data=data_update, headers=headers, method='PATCH')
try:
    with urllib.request.urlopen(req_patch) as resp:
        print(f'UPDATE status: {resp.status}')
        update_allowed = True
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'UPDATE blocked (Expected): HTTP {e.code} - {body}')
    update_allowed = False
except Exception as e:
    print(f'UPDATE failed: {e}')
    update_allowed = False

# 4. DELETE test
req_del = urllib.request.Request(f'{url}/rest/v1/printables?id=eq.1', headers=headers, method='DELETE')
try:
    with urllib.request.urlopen(req_del) as resp:
        print(f'DELETE status: {resp.status}')
        delete_allowed = True
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'DELETE blocked (Expected): HTTP {e.code} - {body}')
    delete_allowed = False
except Exception as e:
    print(f'DELETE failed: {e}')
    delete_allowed = False

print('--- SUMMARY ---')
print(f'SELECT allowed: {select_allowed}')
print(f'INSERT/UPDATE/DELETE allowed: {insert_allowed or update_allowed or delete_allowed}')
