import sys, json, urllib.request

TOKEN = sys.argv[1]
API = sys.argv[2]

req = urllib.request.Request(f"{API}/menu/items")
response = urllib.request.urlopen(req)
data = json.loads(response.read())

items = data if isinstance(data, list) else data.get('items', data.get('data', []))
drinks = [i for i in items if i.get('category_id') is None]

count = 0
for d in drinks:
    req = urllib.request.Request(f"{API}/menu/items/{d['id']}", method="PUT")
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Content-Type", "application/json")
    
    body = json.dumps({"category_id": 7}) # 7 is Beverages
    req.data = body.encode('utf-8')
    
    urllib.request.urlopen(req)
    count += 1
    print(f"Updated {d['name']} -> category_id=7")

print(f"Total updated: {count}")
