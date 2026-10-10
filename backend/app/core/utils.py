

def serialize_document(document:dict)->dict:
    document = document.copy()

    if '_id' in document:
        document['id'] = str(document['_id'])

    return document