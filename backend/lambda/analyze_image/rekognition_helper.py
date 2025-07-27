import boto3

rek = boto3.client('rekognition')

def detect_labels(bucket, key, max_labels=25):
    resp = rek.detect_labels(
        Image={'S3Object': {'Bucket': bucket, 'Name': key}},
        MaxLabels=max_labels,
        MinConfidence=70
    )
    return [l['Name'] for l in resp['Labels']]

def detect_text(bucket, key):
    resp = rek.detect_text(
        Image={'S3Object': {'Bucket': bucket, 'Name': key}}
    )
    return [d['DetectedText'] for d in resp['TextDetections']
            if d['Type'] == 'LINE']
