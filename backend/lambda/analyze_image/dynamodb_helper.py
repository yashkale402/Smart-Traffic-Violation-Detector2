import boto3, datetime, uuid

table = boto3.resource('dynamodb').Table('traffic_violations')

def log_violation(image_url, labels, texts):
    table.put_item(Item={
        "violation_id" : str(uuid.uuid4()),
        "timestamp"    : datetime.datetime.utcnow().isoformat(),
        "image_url"    : image_url,
        "labels"       : labels,
        "detected_text": texts
    })
