import json
from pathlib import Path

base = Path('dist')
with open(base/'fields.json','r',encoding='utf-8') as f:
    field_defs = json.load(f)
with open(base/'presets.min.json','r',encoding='utf-8') as f:
    presets = json.load(f)

def collect_field_refs(obj):
    refs = []
    if isinstance(obj, dict):
        for k,v in obj.items():
            if k in ('fields','moreFields') and isinstance(v, list):
                for item in v:
                    if isinstance(item, str):
                        refs.append(item)
                    elif isinstance(item, dict) and 'key' in item:
                        refs.append(item['key'])
            else:
                refs.extend(collect_field_refs(v))
    elif isinstance(obj, list):
        for item in obj:
            refs.extend(collect_field_refs(item))
    return refs

all_field_keys = set(field_defs.keys())
refs = set(collect_field_refs(presets))
unused = all_field_keys - refs
print(len(unused))

#print(refs)

# Find template labels
template_fields = []
for field_key in refs:
    if field_key.startswith('{'):
        continue
    field_def = field_defs[field_key]
    if isinstance(field_def, dict) and 'label' in field_def:
        label = field_def['label']
        if isinstance(label, str) and '{' in label and '}' in label:
            template_fields.append((field_key, label))

print("\nUnused fields with template labels:")
for key, label in template_fields:
    print(f"{key}: {label}")


print(len(template_fields))
