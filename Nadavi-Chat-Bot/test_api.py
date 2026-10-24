import urllib.request
import json

req = urllib.request.Request(
    'https://api.anthropic.com/v1/messages', 
    method='POST', 
    headers={
        'x-api-key': 'sk-ant-api03-dummykey123', 
        'anthropic-version': '2023-06-01', 
        'content-type': 'application/json'
    }, 
    data=json.dumps({
        'model': 'claude-2.1', 
        'max_tokens': 10, 
        'messages': [{'role': 'user', 'content': 'Hello'}]
    }).encode('utf-8')
)

try:
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except Exception as e:
    if hasattr(e, 'read'):
        print("ERROR BODY:")
        print(e.read().decode('utf-8'))
    else:
        print("OTHER ERROR:")
        print(e)
