import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import json

# Fetch the service account key JSON file contents
cred = credentials.Certificate('../firebase-account.json')

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://pegasus-pool.firebaseio.com'
})
baseNetwork="Mainnet"

masterKeys = "../src/locales/en.json"

# flatten and map
def flatten_json(y):
    out = {}

    def flatten(x, name=''):
        if type(x) is dict:
            for a in x:
                flatten(x[a], name + a + '.')
        elif type(x) is list:
            i = 0
            for a in x:
                flatten(a, name + str(i) + '.')
                i += 1
        else:
            out[name[:-1]] = x

    flatten(y)
    return out

with open(masterKeys) as json_file:
    data = json.load(json_file)
flatMasterKeys = flatten_json(data)

def multi_get(dict_obj, keys, default=None):
    result = dict_obj
    for key in keys:
        if key not in result:
            return default
        result = result[key]
    return result

languages=db.reference(baseNetwork+"/languages").get()
translations=db.reference(baseNetwork+"/translations").get()
for language in languages:
    for item in flatMasterKeys:
        if language in translations and translations[language] is not None:
            print(item)
            val = multi_get(translations[language],item.split("."),None)
        else:
            val = None
        if val is None:
            print("writing: "+baseNetwork+"/translations/"+language+"/"+item.replace(".","/"))
            db.reference(baseNetwork+"/translations/"+language).update({item.replace(".","/"):""})
            
        
    
